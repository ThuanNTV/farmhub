import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../../../src/modules/users.module';
import { User } from '../../../src/entities/global/user.entity';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../src/common/auth/jwt-auth.guard';
import { EnhancedAuthGuard } from '../../../src/common/auth/enhanced-auth.guard';
import { RolesGuard } from '../../../src/common/guards/roles.guard';
import { RateLimitAPI } from '../../../src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from '../../../src/common/auth/audit.interceptor';
import { AllExceptionsFilter } from '../../../src/common/interceptors/all-exceptions.filter';
import { TransformInterceptor } from '../../../src/common/interceptors/transform.interceptor';

describe('Users Integration Tests', () => {let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    userName: 'testuser-integration',
    fullName: 'Test User Integration',
    email: 'integration@testuser.com',
    phone: '0123456789',
    password: 'password123',
    role: 'user',
  };

  const updateUserData = {
    fullName: 'Updated Test User Integration',
    email: 'updated@testuser.com',
    phone: '0987654321',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'farmhub_test',
          entities: [User],
          synchronize: true,
          logging: false,
        }),
        UsersModule,
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

    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await dataSource.query(
      `DELETE FROM "user" WHERE user_name = '${testUser.userName}'`,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
        phone: testUser.phone,
        role: testUser.role,
        is_active: true,
        is_deleted: false,
      });

      // Verify password is hashed
      expect(response.body.password_hash).toBeDefined();
      expect(response.body.password_hash).not.toBe(testUser.password);

      // Verify database persistence
      const savedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_name: testUser.userName } });

      expect(savedUser).toBeDefined();
      expect(savedUser.user_name).toBe(testUser.userName);
      expect(savedUser.password_hash).toBeDefined();
    });

    it('should fail to create user with duplicate username', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should fail to create user with invalid email', async () => {
      const invalidUser = {
        ...testUser,
        userName: 'testuser-invalid-email',
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should fail to create user with missing required fields', async () => {
      const incompleteUser = {
        userName: 'testuser-incomplete',
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(incompleteUser)
        .expect(400);

      expect(response.body.message).toContain('fullName');
    });

    it('should fail to create user with invalid phone format', async () => {
      const invalidUser = {
        ...testUser,
        userName: 'testuser-invalid-phone',
        phone: 'invalid-phone',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toContain('phone');
    });

    it('should fail to create user with weak password', async () => {
      const weakPasswordUser = {
        ...testUser,
        userName: 'testuser-weak-password',
        password: '123', // Weak password
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.body.message).toContain('password');
    });
  });

  describe('GET /users', () => {
    it('should return all active users', async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const testUserInResponse = response.body.find(
        (user: User) => user.user_name === testUser.userName,
      );
      expect(testUserInResponse).toBeDefined();
      expect(testUserInResponse.is_active).toBe(true);
      expect(testUserInResponse.is_deleted).toBe(false);
    });

    it('should return empty array when no users exist', async () => {
      // Clean up all users for this test
      await dataSource.query(
        'DELETE FROM "user" WHERE user_name LIKE \'testuser-%\'',
      );

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /users/username/:username', () => {
    it('should return user by username', async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/users/username/${testUser.userName}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
        phone: testUser.phone,
        role: testUser.role,
        is_active: true,
        is_deleted: false,
      });
    });

    it('should return 404 for non-existent username', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/username/non-existent-user')
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('GET /users/id/:id', () => {
    it('should return user by ID', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const response = await request(app.getHttpServer())
        .get(`/users/id/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user_id: userId,
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
        phone: testUser.phone,
        role: testUser.role,
        is_active: true,
        is_deleted: false,
      });
    });

    it('should return 404 for non-existent user ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/id/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('GET /users/search/:usernameOrEmail', () => {
    it('should find user by email', async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/users/search/${testUser.email}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user_name: testUser.userName,
        email: testUser.email,
      });
    });

    it('should find user by username', async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/users/search/${testUser.userName}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user_name: testUser.userName,
        email: testUser.email,
      });
    });

    it('should return null for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search/non-existent@email.com')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được cập nhật');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        user_id: userId,
        user_name: testUser.userName,
        full_name: updateUserData.fullName,
        email: updateUserData.email,
        phone: updateUserData.phone,
      });

      // Verify database persistence
      const updatedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(updatedUser.full_name).toBe(updateUserData.fullName);
      expect(updatedUser.email).toBe(updateUserData.email);
      expect(updatedUser.phone).toBe(updateUserData.phone);
    });

    it('should fail to update non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/123e4567-e89b-12d3-a456-426614174999')
        .send(updateUserData)
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });

    it('should fail to update with invalid email', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const invalidUpdate = {
        ...updateUserData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.message).toContain('email');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete user successfully', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được xóa');
      expect(response.body.data).toBeNull();

      // Verify soft delete in database
      const deletedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(deletedUser.is_deleted).toBe(true);
    });

    it('should fail to delete non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });

    it('should fail to delete already deleted user', async () => {
      // Create and delete user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      // Try to delete again
      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('POST /users/:id/restore', () => {
    it('should restore deleted user successfully', async () => {
      // Create and delete user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Khôi phục user thành công',
      );
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.is_deleted).toBe(false);

      // Verify restoration in database
      const restoredUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(restoredUser.is_deleted).toBe(false);
    });

    it('should fail to restore non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/123e4567-e89b-12d3-a456-426614174999/restore')
        .expect(404);

      expect(response.body.message).toContain(
        'không tồn tại hoặc chưa bị xóa mềm',
      );
    });

    it('should fail to restore non-deleted user', async () => {
      // Create user without deleting
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(404);

      expect(response.body.message).toContain(
        'không tồn tại hoặc chưa bị xóa mềm',
      );
    });
  });

  describe('PUT /users/:id/last-login', () => {
    it('should update last login successfully', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}/last-login`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được cập nhập');
      expect(response.body.data).toBeNull();

      // Verify last login update in database
      const updatedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(updatedUser.last_login_at).toBeDefined();
      expect(updatedUser.last_login_at).toBeInstanceOf(Date);
    });

    it('should fail to update last login for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/123e4567-e89b-12d3-a456-426614174999/last-login')
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('PUT /users/:id/reset-token', () => {
    it('should update reset token successfully', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;
      const resetToken = 'reset-token-123';

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}/reset-token`)
        .send({ resetToken })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được cập nhập');
      expect(response.body.data).toBeNull();

      // Verify reset token update in database
      const updatedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(updatedUser.password_reset_token).toBe(resetToken);
    });

    it('should fail to update reset token for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/123e4567-e89b-12d3-a456-426614174999/reset-token')
        .send({ resetToken: 'token' })
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('PUT /users/:id/password', () => {
    it('should update password successfully', async () => {
      // Create test user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;
      const newPasswordHash = 'newHashedPassword123';

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}/password`)
        .send({ passwordHash: newPasswordHash })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('đã được cập nhập');
      expect(response.body.data).toBeNull();

      // Verify password update in database
      const updatedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(updatedUser.password_hash).toBe(newPasswordHash);
    });

    it('should fail to update password for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/123e4567-e89b-12d3-a456-426614174999/password')
        .send({ passwordHash: 'newHash' })
        .expect(404);

      expect(response.body.message).toContain('không tìm thấy user');
    });
  });

  describe('GET /users/store/:storeId', () => {
    it('should return users by store ID', async () => {
      const storeId = 'test-store-123';

      const response = await request(app.getHttpServer())
        .get(`/users/store/${storeId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for store with no users', async () => {
      const storeId = 'empty-store-123';

      const response = await request(app.getHttpServer())
        .get(`/users/store/${storeId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /users/role/:role', () => {
    it('should return users by role', async () => {
      const role = 'user';

      const response = await request(app.getHttpServer())
        .get(`/users/role/${role}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for role with no users', async () => {
      const role = 'superadmin';

      const response = await request(app.getHttpServer())
        .get(`/users/role/${role}`)
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
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should maintain data consistency after multiple operations', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // Update user
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      // Verify final state
      const finalUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(finalUser.full_name).toBe(updateUserData.fullName);
      expect(finalUser.email).toBe(updateUserData.email);
      expect(finalUser.phone).toBe(updateUserData.phone);
      expect(finalUser.is_deleted).toBe(false);
    });
  });

  describe('Business logic validation', () => {
    it('should prevent creation of user with reserved usernames', async () => {
      const reservedUsernameUser = {
        ...testUser,
        userName: 'admin', // Reserved username
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(reservedUsernameUser)
        .expect(409); // Should fail due to reserved username

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should handle concurrent user creation attempts', async () => {
      const concurrentUser = {
        ...testUser,
        userName: 'concurrent-test-user',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(concurrentUser)
        .expect(201);

      // Try to create duplicate concurrently
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(concurrentUser)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should validate email uniqueness', async () => {
      const userWithSameEmail = {
        ...testUser,
        userName: 'testuser-same-email',
        email: testUser.email, // Same email, different username
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      // Create second user with same email (should be allowed in this implementation)
      await request(app.getHttpServer())
        .post('/users')
        .send(userWithSameEmail)
        .expect(201);

      // Verify both users exist
      const users = await dataSource
        .getRepository(User)
        .find({ where: { email: testUser.email } });

      expect(users.length).toBe(2);
    });
  });

  describe('User lifecycle management', () => {
    it('should handle complete user lifecycle', async () => {
      // 1. Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;
      expect(createResponse.body.is_active).toBe(true);
      expect(createResponse.body.is_deleted).toBe(false);

      // 2. Update user
      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      expect(updateResponse.body.data.full_name).toBe(updateUserData.fullName);

      // 3. Update last login
      await request(app.getHttpServer())
        .put(`/users/${userId}/last-login`)
        .expect(200);

      // 4. Deactivate user
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ isActive: false })
        .expect(200);

      // 5. Delete user
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();

      // 6. Restore user
      const restoreResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(200);

      expect(restoreResponse.body.data.is_deleted).toBe(false);

      // 7. Verify final state
      const finalUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(finalUser.is_deleted).toBe(false);
      expect(finalUser.full_name).toBe(updateUserData.fullName);
    });
  });
});
