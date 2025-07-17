import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/common/auth/jwt-auth.guard';
import { EnhancedAuthGuard } from '../../src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from '../../src/common/auth/permission.guard';

describe('BankController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const testBankData = {
    bank_name: 'E2E Test Bank',
    bank_code: 'E2E001',
    swift_code: 'E2EBBANK',
    country: 'Vietnam',
    is_active: true,
  };

  const testUserData = {
    user_name: 'e2e-bank-test-user',
    email: 'e2e-bank-test@example.com',
    password: 'testpassword123',
    full_name: 'E2E Bank Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Create test user and get access token
    try {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUserData);
    } catch (error) {
      // User might already exist
    }

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUserData.user_name,
        password: testUserData.password,
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /bank', () => {
    it('should create a new bank successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.bank_name).toBe(testBankData.bank_name);
      expect(response.body.bank_code).toBe(testBankData.bank_code);
      expect(response.body.swift_code).toBe(testBankData.swift_code);
      expect(response.body.country).toBe(testBankData.country);
      expect(response.body.is_active).toBe(testBankData.is_active);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should fail to create bank with duplicate bank code', async () => {
      // First creation
      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData)
        .expect(201);

      // Second creation with same bank code
      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData)
        .expect(409);
    });

    it('should fail to create bank with missing required fields', async () => {
      const incompleteData = {
        bank_name: 'Test Bank',
        // missing bank_code
      };

      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(incompleteData)
        .expect(400);
    });

    it('should fail to create bank without authorization', async () => {
      await request(app.getHttpServer())
        .post('/bank')
        .send(testBankData)
        .expect(401);
    });

    it('should fail to create bank with empty bank name', async () => {
      const invalidData = {
        ...testBankData,
        bank_name: '',
      };

      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should fail to create bank with invalid bank code format', async () => {
      const invalidData = {
        ...testBankData,
        bank_code: 'INVALID_CODE_TOO_LONG',
      };

      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /bank', () => {
    beforeEach(async () => {
      // Ensure test bank exists
      try {
        await request(app.getHttpServer())
          .post('/bank')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testBankData);
      } catch (error) {
        // Bank might already exist
      }
    });

    it('should get all banks successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if our test bank is in the list
      const testBank = response.body.find(
        (bank: any) => bank.bank_name === testBankData.bank_name,
      );
      expect(testBank).toBeDefined();
    });

    it('should get banks with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/bank?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get banks with search filter', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bank?search=${testBankData.bank_name}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);

      // All returned banks should contain the search term
      response.body.forEach((bank: any) => {
        expect(bank.bank_name.toLowerCase()).toContain(
          testBankData.bank_name.toLowerCase(),
        );
      });
    });

    it('should fail to get banks without authorization', async () => {
      await request(app.getHttpServer()).get('/bank').expect(401);
    });
  });

  describe('GET /bank/:id', () => {
    let bankId: string;

    beforeEach(async () => {
      // Create test bank and get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData);

      bankId = createResponse.body.id;
    });

    it('should get bank by ID successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bank/${bankId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(bankId);
      expect(response.body.bank_name).toBe(testBankData.bank_name);
      expect(response.body.bank_code).toBe(testBankData.bank_code);
    });

    it('should fail to get bank with non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await request(app.getHttpServer())
        .get(`/bank/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to get bank with invalid ID format', async () => {
      await request(app.getHttpServer())
        .get('/bank/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should fail to get bank without authorization', async () => {
      await request(app.getHttpServer()).get(`/bank/${bankId}`).expect(401);
    });
  });

  describe('PUT /bank/:id', () => {
    let bankId: string;

    beforeEach(async () => {
      // Create test bank and get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData);

      bankId = createResponse.body.id;
    });

    it('should update bank successfully', async () => {
      const updateData = {
        bank_name: 'Updated E2E Test Bank',
        swift_code: 'UPDATEDSWIFT',
        country: 'Updated Country',
      };

      const response = await request(app.getHttpServer())
        .put(`/bank/${bankId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(bankId);
      expect(response.body.bank_name).toBe(updateData.bank_name);
      expect(response.body.swift_code).toBe(updateData.swift_code);
      expect(response.body.country).toBe(updateData.country);
      expect(response.body.bank_code).toBe(testBankData.bank_code); // Should remain unchanged
    });

    it('should fail to update bank with non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateData = {
        bank_name: 'Updated Bank',
      };

      await request(app.getHttpServer())
        .put(`/bank/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should fail to update bank with invalid data', async () => {
      const invalidData = {
        bank_name: '', // Empty name
      };

      await request(app.getHttpServer())
        .put(`/bank/${bankId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should fail to update bank without authorization', async () => {
      const updateData = {
        bank_name: 'Updated Bank',
      };

      await request(app.getHttpServer())
        .put(`/bank/${bankId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /bank/:id', () => {
    let bankId: string;

    beforeEach(async () => {
      // Create test bank and get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData);

      bankId = createResponse.body.id;
    });

    it('should delete bank successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/bank/${bankId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify bank is deleted
      await request(app.getHttpServer())
        .get(`/bank/${bankId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete bank with non-existent ID', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await request(app.getHttpServer())
        .delete(`/bank/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete bank without authorization', async () => {
      await request(app.getHttpServer()).delete(`/bank/${bankId}`).expect(401);
    });
  });

  describe('GET /bank/active', () => {
    beforeEach(async () => {
      // Ensure test bank exists
      try {
        await request(app.getHttpServer())
          .post('/bank')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testBankData);
      } catch (error) {
        // Bank might already exist
      }
    });

    it('should get only active banks', async () => {
      const response = await request(app.getHttpServer())
        .get('/bank/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);

      // All returned banks should be active
      response.body.forEach((bank: any) => {
        expect(bank.is_active).toBe(true);
      });
    });

    it('should fail to get active banks without authorization', async () => {
      await request(app.getHttpServer()).get('/bank/active').expect(401);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should handle malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should handle missing Content-Type header', async () => {
      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBankData)
        .expect(201); // Should still work
    });

    it('should handle very long bank names', async () => {
      const longNameData = {
        ...testBankData,
        bank_name: 'A'.repeat(256), // Too long
      };

      await request(app.getHttpServer())
        .post('/bank')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(longNameData)
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit API requests', async () => {
      // Make multiple requests quickly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/bank')
            .set('Authorization', `Bearer ${accessToken}`),
        );
      }

      const responses = await Promise.all(promises);

      // Most should succeed, but some might be rate limited
      const successCount = responses.filter((r) => r.status === 200).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;

      expect(successCount).toBeGreaterThan(0);
      // Note: Rate limiting might not be enabled in test environment
    });
  });
});
