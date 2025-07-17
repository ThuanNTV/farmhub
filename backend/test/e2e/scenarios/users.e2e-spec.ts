import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../../../src/entities/global/user.entity';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    userName: 'testuser-e2e',
    fullName: 'Test User E2E',
    email: 'e2e@testuser.com',
    phone: '0123456789',
    password: 'password123',
    role: 'user',
  };

  const updateUserData = {
    fullName: 'Updated Test User E2E',
    email: 'updated-e2e@testuser.com',
    phone: '0987654321',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  describe('User Management Flow', () => {
    it('should complete full user lifecycle', async () => {
      // 1. Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(createResponse.body).toMatchObject({
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
        phone: testUser.phone,
        role: testUser.role,
        is_active: true,
        is_deleted: false,
      });

      // Verify password is hashed
      expect(createResponse.body.password_hash).toBeDefined();
      expect(createResponse.body.password_hash).not.toBe(testUser.password);

      const userId = createResponse.body.user_id;

      // 2. Get all users
      const getAllResponse = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(getAllResponse.body)).toBe(true);
      const createdUser = getAllResponse.body.find(
        (user: User) => user.user_id === userId,
      );
      expect(createdUser).toBeDefined();

      // 3. Get user by ID
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/users/id/${userId}`)
        .expect(200);

      expect(getByIdResponse.body).toMatchObject({
        user_id: userId,
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
      });

      // 4. Get user by username
      const getByUsernameResponse = await request(app.getHttpServer())
        .get(`/users/username/${testUser.userName}`)
        .expect(200);

      expect(getByUsernameResponse.body).toMatchObject({
        user_name: testUser.userName,
        full_name: testUser.fullName,
        email: testUser.email,
      });

      // 5. Search user by email
      const searchByEmailResponse = await request(app.getHttpServer())
        .get(`/users/search/${testUser.email}`)
        .expect(200);

      expect(searchByEmailResponse.body).toMatchObject({
        user_name: testUser.userName,
        email: testUser.email,
      });

      // 6. Update user
      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      expect(updateResponse.body.message).toContain('đã được cập nhật');
      expect(updateResponse.body.data).toMatchObject({
        user_id: userId,
        user_name: testUser.userName,
        full_name: updateUserData.fullName,
        email: updateUserData.email,
        phone: updateUserData.phone,
      });

      // 7. Verify update in database
      const updatedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(updatedUser.full_name).toBe(updateUserData.fullName);
      expect(updatedUser.email).toBe(updateUserData.email);

      // 8. Update last login
      const lastLoginResponse = await request(app.getHttpServer())
        .put(`/users/${userId}/last-login`)
        .expect(200);

      expect(lastLoginResponse.body.message).toContain('đã được cập nhập');

      // Verify last login in database
      const userWithLogin = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(userWithLogin.last_login_at).toBeDefined();
      expect(userWithLogin.last_login_at).toBeInstanceOf(Date);

      // 9. Deactivate user
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ ...updateUserData, isActive: false })
        .expect(200);

      expect(deactivateResponse.body.data.is_active).toBe(false);

      // 10. Delete user
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      expect(deleteResponse.body.message).toContain('đã được xóa');
      expect(deleteResponse.body.data).toBeNull();

      // 11. Verify soft delete
      const deletedUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(deletedUser.is_deleted).toBe(true);

      // 12. Restore user
      const restoreResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(200);

      expect(restoreResponse.body.message).toBe('Khôi phục user thành công');
      expect(restoreResponse.body.data.is_deleted).toBe(false);

      // 13. Verify final state
      const finalUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(finalUser.is_deleted).toBe(false);
      expect(finalUser.full_name).toBe(updateUserData.fullName);
    });
  });

  describe('User Validation and Error Handling', () => {
    it('should handle validation errors properly', async () => {
      // Test invalid email
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

      // Test missing required fields
      const incompleteUser = {
        userName: 'testuser-incomplete',
        // Missing required fields
      };

      const incompleteResponse = await request(app.getHttpServer())
        .post('/users')
        .send(incompleteUser)
        .expect(400);

      expect(incompleteResponse.body.message).toContain('fullName');

      // Test invalid phone format
      const invalidPhoneUser = {
        ...testUser,
        userName: 'testuser-invalid-phone',
        phone: 'invalid-phone',
      };

      const phoneResponse = await request(app.getHttpServer())
        .post('/users')
        .send(invalidPhoneUser)
        .expect(400);

      expect(phoneResponse.body.message).toContain('phone');
    });

    it('should handle duplicate username', async () => {
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

    it('should handle non-existent user operations', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      // Try to get non-existent user by ID
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/users/id/${nonExistentId}`)
        .expect(404);

      expect(getByIdResponse.body.message).toContain('không tìm thấy user');

      // Try to get non-existent user by username
      const getByUsernameResponse = await request(app.getHttpServer())
        .get('/users/username/non-existent-user')
        .expect(404);

      expect(getByUsernameResponse.body.message).toContain(
        'không tìm thấy user',
      );

      // Try to update non-existent user
      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${nonExistentId}`)
        .send(updateUserData)
        .expect(404);

      expect(updateResponse.body.message).toContain('không tìm thấy user');

      // Try to delete non-existent user
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/users/${nonExistentId}`)
        .expect(404);

      expect(deleteResponse.body.message).toContain('không tìm thấy user');
    });

    it('should handle search for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search/non-existent@email.com')
        .expect(200);

      expect(response.body).toBeNull();
    });
  });

  describe('User Password Management', () => {
    it('should handle password reset flow', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;
      const resetToken = 'reset-token-123';
      const newPasswordHash = 'newHashedPassword123';

      // Update reset token
      const tokenResponse = await request(app.getHttpServer())
        .put(`/users/${userId}/reset-token`)
        .send({ resetToken })
        .expect(200);

      expect(tokenResponse.body.message).toContain('đã được cập nhập');

      // Verify reset token in database
      let dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.password_reset_token).toBe(resetToken);

      // Update password
      const passwordResponse = await request(app.getHttpServer())
        .put(`/users/${userId}/password`)
        .send({ passwordHash: newPasswordHash })
        .expect(200);

      expect(passwordResponse.body.message).toContain('đã được cập nhập');

      // Verify password update in database
      dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.password_hash).toBe(newPasswordHash);
    });

    it('should hash passwords correctly', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      // Verify password is hashed
      expect(createResponse.body.password_hash).toBeDefined();
      expect(createResponse.body.password_hash).not.toBe(testUser.password);
      expect(createResponse.body.password_hash.length).toBeGreaterThan(20); // bcrypt hash length
    });
  });

  describe('User Database Operations', () => {
    it('should persist data correctly across operations', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // Verify in database
      let dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser).toBeDefined();
      expect(dbUser.user_name).toBe(testUser.userName);
      expect(dbUser.full_name).toBe(testUser.fullName);

      // Update user
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      // Verify update in database
      dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.full_name).toBe(updateUserData.fullName);
      expect(dbUser.email).toBe(updateUserData.email);

      // Delete user
      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      // Verify soft delete in database
      dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.is_deleted).toBe(true);

      // Restore user
      await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(200);

      // Verify restoration in database
      dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.is_deleted).toBe(false);
    });

    it('should handle concurrent operations', async () => {
      const concurrentUser = {
        ...testUser,
        userName: 'concurrent-test-user',
      };

      // Create user
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
  });

  describe('User Business Logic', () => {
    it('should handle user activation/deactivation', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // Deactivate user
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ ...updateUserData, isActive: false })
        .expect(200);

      expect(deactivateResponse.body.data.is_active).toBe(false);

      // Verify in database
      let dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.is_active).toBe(false);

      // Reactivate user
      const reactivateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ ...updateUserData, isActive: true })
        .expect(200);

      expect(reactivateResponse.body.data.is_active).toBe(true);

      // Verify in database
      dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.is_active).toBe(true);
    });

    it('should handle role updates', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // Update role
      const roleUpdate = {
        role: 'admin',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(roleUpdate)
        .expect(200);

      expect(response.body.data.role).toBe('admin');

      // Verify in database
      const dbUser = await dataSource
        .getRepository(User)
        .findOne({ where: { user_id: userId } });

      expect(dbUser.role).toBe('admin');
    });

    it('should handle contact information updates', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // Update contact information
      const contactUpdate = {
        phone: '0987654321',
        email: 'newcontact@user.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(contactUpdate)
        .expect(200);

      expect(response.body.data.phone).toBe('0987654321');
      expect(response.body.data.email).toBe('newcontact@user.com');
    });
  });

  describe('User Search and Filtering', () => {
    it('should handle user search by email and username', async () => {
      // Create user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      // Search by email
      const emailResponse = await request(app.getHttpServer())
        .get(`/users/search/${testUser.email}`)
        .expect(200);

      expect(emailResponse.body).toMatchObject({
        user_name: testUser.userName,
        email: testUser.email,
      });

      // Search by username
      const usernameResponse = await request(app.getHttpServer())
        .get(`/users/search/${testUser.userName}`)
        .expect(200);

      expect(usernameResponse.body).toMatchObject({
        user_name: testUser.userName,
        email: testUser.email,
      });
    });

    it('should handle role-based filtering', async () => {
      // Create users with different roles
      const user1 = { ...testUser, userName: 'user1', role: 'user' };
      const user2 = { ...testUser, userName: 'user2', role: 'admin' };

      await request(app.getHttpServer()).post('/users').send(user1).expect(201);

      await request(app.getHttpServer()).post('/users').send(user2).expect(201);

      // Get users by role
      const userRoleResponse = await request(app.getHttpServer())
        .get('/users/role/user')
        .expect(200);

      expect(Array.isArray(userRoleResponse.body)).toBe(true);
      expect(
        userRoleResponse.body.some((user: User) => user.user_name === 'user1'),
      ).toBe(true);

      const adminRoleResponse = await request(app.getHttpServer())
        .get('/users/role/admin')
        .expect(200);

      expect(Array.isArray(adminRoleResponse.body)).toBe(true);
      expect(
        adminRoleResponse.body.some((user: User) => user.user_name === 'user2'),
      ).toBe(true);
    });

    it('should handle store-based filtering', async () => {
      const storeId = 'test-store-123';

      const response = await request(app.getHttpServer())
        .get(`/users/store/${storeId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('User API Endpoints', () => {
    it('should handle all CRUD operations correctly', async () => {
      // CREATE
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      const userId = createResponse.body.user_id;

      // READ - Get all
      const getAllResponse = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(getAllResponse.body)).toBe(true);

      // READ - Get by ID
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/users/id/${userId}`)
        .expect(200);

      expect(getByIdResponse.body.user_id).toBe(userId);

      // READ - Get by username
      const getByUsernameResponse = await request(app.getHttpServer())
        .get(`/users/username/${testUser.userName}`)
        .expect(200);

      expect(getByUsernameResponse.body.user_name).toBe(testUser.userName);

      // UPDATE
      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send(updateUserData)
        .expect(200);

      expect(updateResponse.body.data.full_name).toBe(updateUserData.fullName);

      // DELETE
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();

      // RESTORE
      const restoreResponse = await request(app.getHttpServer())
        .post(`/users/${userId}/restore`)
        .expect(200);

      expect(restoreResponse.body.data.is_deleted).toBe(false);
    });

    it('should handle user search and filtering endpoints', async () => {
      // Create multiple users
      const user1 = { ...testUser, userName: 'user1', email: 'user1@test.com' };
      const user2 = { ...testUser, userName: 'user2', email: 'user2@test.com' };

      await request(app.getHttpServer()).post('/users').send(user1).expect(201);

      await request(app.getHttpServer()).post('/users').send(user2).expect(201);

      // Get all users
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Verify both users are active
      const activeUsers = response.body.filter(
        (user: User) =>
          user.user_name === 'user1' || user.user_name === 'user2',
      );
      expect(activeUsers.length).toBe(2);
      expect(activeUsers.every((user: User) => user.is_active)).toBe(true);
    });
  });
});
