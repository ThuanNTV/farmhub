import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { TestHelpers } from '../../utils/test-helpers';
import { TestAuth } from '../../utils/test-auth';
import { JwtService } from '@nestjs/jwt';

describe('User Authentication E2E Scenario', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete User Authentication Flow', () => {
    let authToken: string;
    let userId: string;

    it('should register a new user successfully', async () => {
      const registerData = {
        userName: 'e2etestuser',
        email: 'e2etest@example.com',
        password: 'password123',
        fullName: 'E2E Test User',
        role: 'store_manager',
        phone: '0123456789',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('user_id');
      expect(response.body.user_name).toBe(registerData.userName);
      expect(response.body.email).toBe(registerData.email);
      expect(response.body.full_name).toBe(registerData.fullName);
      expect(response.body.role).toBe(registerData.role);

      userId = response.body.user_id;
    });

    it('should login with the registered user', async () => {
      const loginData = {
        usernameOrEmail: 'e2etestuser',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('sessionId');

      authToken = response.body.data.access_token;
    });

    it('should access protected endpoint with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId');
      expect(response.body.userName).toBe('e2etestuser');
    });

    it('should be denied access to protected endpoint without token', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('should be denied access to protected endpoint with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Đăng xuất thành công');
    });

    it('should not be able to access protected endpoint after logout', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset for existing user', async () => {
      const forgotPasswordData = {
        email: 'e2etest@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Password reset token sent to email');
    });

    it('should return 401 for non-existent user in password reset', async () => {
      const forgotPasswordData = {
        email: 'nonexistent@example.com',
      };

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordData)
        .expect(401);
    });
  });

  describe('User Registration Validation', () => {
    it('should reject registration with duplicate username', async () => {
      const registerData = {
        userName: 'e2etestuser', // Already exists
        email: 'different@example.com',
        password: 'password123',
        fullName: 'Duplicate User',
        role: 'store_manager',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should reject registration with duplicate email', async () => {
      const registerData = {
        userName: 'differentuser',
        email: 'e2etest@example.com', // Already exists
        password: 'password123',
        fullName: 'Duplicate User',
        role: 'store_manager',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });
  });
});
