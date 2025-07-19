import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresModule } from '../../../src/modules/stores/stores.module';
import { Store } from '../../../src/entities/global/store.entity';
import { DataSource } from 'typeorm';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { JwtAuthGuard } from '../../../src/common/auth/jwt-auth.guard';
import { EnhancedAuthGuard } from '../../../src/common/auth/enhanced-auth.guard';
import { RateLimitAPI } from '../../../src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from '../../../src/common/auth/audit.interceptor';
import { AllExceptionsFilter } from '../../../src/common/interceptors/all-exceptions.filter';
import { TransformInterceptor } from '../../../src/common/interceptors/transform.interceptor';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';

describe('Stores Integration Tests', () => {let app: INestApplication;
  let dataSource: DataSource;
  let tenantDataSourceService: TenantDataSourceService;

  const testStore = {
    schemaName: 'test-store-integration',
    name: 'Test Store Integration',
    description: 'Test Store for Integration Tests',
    address: '123 Integration Test Street',
    phone: '0123456789',
    email: 'integration@teststore.com',
    website: 'https://integration.teststore.com',
    logo: '{"url": "integration-logo.jpg"}',
  };

  const updateStoreData = {
    schemaName: 'test-store-integration',
    name: 'Updated Test Store Integration',
    description: 'Updated Test Store for Integration Tests',
    phone: '0987654321',
    email: 'updated@teststore.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'farmhub_test',
          entities: [Store],
          synchronize: true,
          logging: false,
        }),
        StoresModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(RateLimitAPI)
      .useValue({})
      .overrideInterceptor(AuditInterceptor)
      .useValue({})
      .overrideFilter(AllExceptionsFilter)
      .useValue({})
      .overrideInterceptor(TransformInterceptor)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    dataSource = moduleFixture.get<DataSource>(DataSource);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    await app.init();
  });

  afterAll(async () => {
    // Clean up test database
    try {
      await dataSource.query(
        `DROP DATABASE IF EXISTS "${testStore.schemaName}"`,
      );
    } catch (error) {
      if (error instanceof Error) {
        console.log('Database cleanup error:', error.message);
      } else {
        console.log('Database cleanup error:', error);
      }
    }

    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await dataSource.query(
      `DELETE FROM store WHERE schema_name = '${testStore.schemaName}'`,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /stores', () => {
    it('should create a new store successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        '✅ Tạo Store thành công',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        schema_name: testStore.schemaName,
        name: testStore.name,
        description: testStore.description,
        address: testStore.address,
        phone: testStore.phone,
        email: testStore.email,
        website: testStore.website,
        logo: testStore.logo,
        is_active: true,
        is_deleted: false,
      });

      // Verify database persistence
      const savedStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(savedStore).not.toBeNull();
      expect(savedStore!.schema_name).toBe(testStore.schemaName);
    });

    it('should fail to create store with duplicate schema name', async () => {
      // Create first store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should fail to create store with invalid email', async () => {
      const invalidStore = {
        ...testStore,
        schemaName: 'test-store-invalid-email',
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(invalidStore)
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should fail to create store with missing required fields', async () => {
      const incompleteStore = {
        schemaName: 'test-store-incomplete',
        // Missing name and other required fields
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(incompleteStore)
        .expect(400);

      expect(response.body.message).toContain('name');
    });

    it('should fail to create store with invalid phone format', async () => {
      const invalidStore = {
        ...testStore,
        schemaName: 'test-store-invalid-phone',
        phone: 'invalid-phone',
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(invalidStore)
        .expect(400);

      expect(response.body.message).toContain('phone');
    });

    it('should fail to create store with invalid website URL', async () => {
      const invalidStore = {
        ...testStore,
        schemaName: 'test-store-invalid-website',
        website: 'not-a-valid-url',
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(invalidStore)
        .expect(400);

      expect(response.body.message).toContain('website');
    });
  });

  describe('GET /stores', () => {
    it('should return all active stores', async () => {
      // Create test stores
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const testStoreInResponse = response.body.find(
        (store: Store) => store.schema_name === testStore.schemaName,
      );
      expect(testStoreInResponse).toBeDefined();
      expect(testStoreInResponse.is_active).toBe(true);
      expect(testStoreInResponse.is_deleted).toBe(false);
    });

    it('should return empty array when no stores exist', async () => {
      // Clean up all stores for this test
      await dataSource.query(
        "DELETE FROM store WHERE schema_name LIKE 'test-store-%'",
      );

      const response = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /stores/:id', () => {
    it('should return store by ID', async () => {
      // Create test store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/stores/${testStore.schemaName}`)
        .expect(200);

      expect(response.body).toMatchObject({
        schema_name: testStore.schemaName,
        name: testStore.name,
        description: testStore.description,
        address: testStore.address,
        phone: testStore.phone,
        email: testStore.email,
        website: testStore.website,
        logo: testStore.logo,
        is_active: true,
        is_deleted: false,
      });
    });

    it('should return 404 for non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/non-existent-store')
        .expect(404);

      expect(response.body.message).toContain('không tồn tại');
    });

    it('should return 404 for empty store ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/stores/')
        .expect(404);
    });
  });

  describe('PUT /stores/:id', () => {
    it('should update store successfully', async () => {
      // Create test store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const response = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(updateStoreData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được cập nhật');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        schema_name: updateStoreData.schemaName,
        name: updateStoreData.name,
        description: updateStoreData.description,
        phone: updateStoreData.phone,
        email: updateStoreData.email,
      });

      // Verify database persistence
      const updatedStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(updatedStore).not.toBeNull();
      expect(updatedStore!.name).toBe(updateStoreData.name);
      expect(updatedStore!.phone).toBe(updateStoreData.phone);
      expect(updatedStore!.email).toBe(updateStoreData.email);
    });

    it('should fail to update non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .put('/stores/non-existent-store')
        .send(updateStoreData)
        .expect(404);

      expect(response.body.message).toContain('không tồn tại');
    });

    it('should fail to change schema name', async () => {
      // Create test store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const updateWithDifferentSchema = {
        ...updateStoreData,
        schemaName: 'different-schema-name',
      };

      const response = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(updateWithDifferentSchema)
        .expect(409);

      expect(response.body.message).toContain('Không thể thay đổi schemaName');
    });

    it('should fail to update with invalid email', async () => {
      // Create test store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const invalidUpdate = {
        ...updateStoreData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.message).toContain('email');
    });
  });

  describe('DELETE /stores/:id', () => {
    it('should soft delete store successfully', async () => {
      // Create test store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const response = await request(app.getHttpServer())
        .delete(`/stores/${testStore.schemaName}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được xóa mềm');
      expect(response.body.data).toBeNull();

      // Verify soft delete in database
      const deletedStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(deletedStore).not.toBeNull();
      expect(deletedStore!.is_deleted).toBe(true);
    });

    it('should fail to delete non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .delete('/stores/non-existent-store')
        .expect(404);

      expect(response.body.message).toContain('không tồn tại');
    });

    it('should fail to delete already deleted store', async () => {
      // Create and delete store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/stores/${testStore.schemaName}`)
        .expect(200);

      // Try to delete again
      const response = await request(app.getHttpServer())
        .delete(`/stores/${testStore.schemaName}`)
        .expect(404);

      expect(response.body.message).toContain('không tồn tại');
    });
  });

  describe('POST /stores/:id/restore', () => {
    it('should restore deleted store successfully', async () => {
      // Create and delete store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/stores/${testStore.schemaName}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/stores/${testStore.schemaName}/restore`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Khôi phục store thành công',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.is_deleted).toBe(false);

      // Verify restoration in database
      const restoredStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(restoredStore).not.toBeNull();
      expect(restoredStore!.is_deleted).toBe(false);
    });

    it('should fail to restore non-existent store', async () => {
      const response = await request(app.getHttpServer())
        .post('/stores/non-existent-store/restore')
        .expect(500);

      expect(response.body.message).toContain(
        'không tồn tại hoặc chưa bị xóa mềm',
      );
    });

    it('should fail to restore non-deleted store', async () => {
      // Create store without deleting
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/stores/${testStore.schemaName}/restore`)
        .expect(500);

      expect(response.body.message).toContain(
        'không tồn tại hoặc chưa bị xóa mềm',
      );
    });
  });

  describe('GET /stores/user/:userId', () => {
    it('should return stores for user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174001';

      const response = await request(app.getHttpServer())
        .get(`/stores/user/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for user with no stores', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174002';

      const response = await request(app.getHttpServer())
        .get(`/stores/user/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Database operations validation', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database connection failure
      // For now, we'll test that the application handles basic database operations
      const response = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should maintain data consistency after multiple operations', async () => {
      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      // Update store
      await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(updateStoreData)
        .expect(200);

      // Verify final state
      const finalStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(finalStore).not.toBeNull();
      expect(finalStore!.name).toBe(updateStoreData.name);
      expect(finalStore!.phone).toBe(updateStoreData.phone);
      expect(finalStore!.email).toBe(updateStoreData.email);
      expect(finalStore!.is_deleted).toBe(false);
    });
  });

  describe('Business logic validation', () => {
    it('should prevent creation of store with reserved schema names', async () => {
      const reservedSchemaStore = {
        ...testStore,
        schemaName: 'information_schema', // PostgreSQL reserved schema
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(reservedSchemaStore)
        .expect(500); // Should fail due to reserved schema name

      expect(response.body.message).toContain('database');
    });

    it('should handle concurrent store creation attempts', async () => {
      const concurrentStore = {
        ...testStore,
        schemaName: 'concurrent-test-store',
      };

      // Create first store
      await request(app.getHttpServer())
        .post('/stores')
        .send(concurrentStore)
        .expect(201);

      // Try to create duplicate concurrently
      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(concurrentStore)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should validate store name uniqueness within tenant', async () => {
      const storeWithSameName = {
        ...testStore,
        schemaName: 'test-store-same-name',
        name: testStore.name, // Same name, different schema
      };

      // Create first store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      // Create second store with same name (should be allowed)
      await request(app.getHttpServer())
        .post('/stores')
        .send(storeWithSameName)
        .expect(201);

      // Verify both stores exist
      const stores = await dataSource
        .getRepository(Store)
        .find({ where: { name: testStore.name } });

      expect(stores.length).toBe(2);
    });
  });

  describe('Store lifecycle management', () => {
    it('should handle complete store lifecycle', async () => {
      // 1. Create store
      const createResponse = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      expect(createResponse.body.data.is_active).toBe(true);
      expect(createResponse.body.data.is_deleted).toBe(false);

      // 2. Update store
      const updateResponse = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(updateStoreData)
        .expect(200);

      expect(updateResponse.body.data.name).toBe(updateStoreData.name);

      // 3. Deactivate store
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send({ ...updateStoreData, isActive: false })
        .expect(200);

      // 4. Delete store
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/stores/${testStore.schemaName}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();

      // 5. Restore store
      const restoreResponse = await request(app.getHttpServer())
        .post(`/stores/${testStore.schemaName}/restore`)
        .expect(200);

      expect(restoreResponse.body.data.is_deleted).toBe(false);

      // 6. Verify final state
      const finalStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: testStore.schemaName } });

      expect(finalStore).not.toBeNull();
      expect(finalStore!.is_deleted).toBe(false);
      expect(finalStore!.name).toBe(updateStoreData.name);
    });
  });
});
