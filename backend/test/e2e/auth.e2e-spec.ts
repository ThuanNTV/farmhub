import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtAuthGuard } from '../../src/common/auth/jwt-auth.guard';
import { EnhancedAuthGuard } from '../../src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from '@common/auth/permission.guard';
import { App } from 'supertest/types';

// Helper function to safely convert HttpServer to supertest App type
const getTestApp = (app: INestApplication): App =>
  app.getHttpServer() as unknown as App;

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const testUserData = {
    userName: 'e2e-test-user',
    email: 'e2e-test@example.com',
    password: 'testpassword123',
    fullName: 'E2E Test User',
    role: 'store_manager',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(getTestApp(app))
        .post('/auth/register')
        .send(testUserData)
        .expect(201);
      interface UserResponse {
        user_name: string;
        email: string;
        full_name: string;
        password: string;
        id: string;
        created_at: string;
      }
      const user = response.body as UserResponse;
      expect(user).toBeDefined();
      expect(user.user_name).toBe(testUserData.userName);
      expect(user.email).toBe(testUserData.email);
      expect(user.full_name).toBe(testUserData.fullName);
      expect(user.password_hash).not.toBe(testUserData.password); // Should be hashed
      expect(user).toHaveProperty('user_id');
      expect(user).toHaveProperty('created_at');
    });

    it('should fail to register with duplicate username', async () => {
      // First registration
      await request(getTestApp(app))
        .post('/auth/register')
        .send(testUserData)
        .expect(201);

      // Second registration with same username
      await request(getTestApp(app))
        .post('/auth/register')
        .send(testUserData)
        .expect(409);
    });

    it('should fail to register with duplicate email', async () => {
      // First registration
      await request(getTestApp(app))
        .post('/auth/register')
        .send(testUserData)
        .expect(201);

      // Second registration with same email but different username
      const duplicateEmailData = {
        ...testUserData,
        userName: 'different-username',
      };

      await request(getTestApp(app))
        .post('/auth/register')
        .send(duplicateEmailData)
        .expect(409);
    });

    it('should fail to register with invalid email format', async () => {
      const invalidData = {
        ...testUserData,
        email: 'invalid-email',
      };

      await request(getTestApp(app))
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should fail to register with missing required fields', async () => {
      const incompleteData = {
        userName: 'testuser',
        // missing email and password
      };

      await request(getTestApp(app))
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);
    });

    it('should fail to register with empty username', async () => {
      const invalidData = {
        ...testUserData,
        userName: '',
      };

      await request(getTestApp(app))
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should fail to register with weak password', async () => {
      const invalidData = {
        ...testUserData,
        password: '123', // too short
      };

      await request(getTestApp(app))
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Ensure test user exists
      try {
        await request(getTestApp(app))
          .post('/auth/register')
          .send(testUserData);
      } catch {
        // User might already exist, that's okay
      }
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: testUserData.password,
        })
        .expect(201);
      interface LoginResponse {
        access_token: string;
        user: {
          user_name: string;
          email: string;
        };
      }
      const login = response.body as LoginResponse;
      expect(login).toBeDefined();
      expect(login).toHaveProperty('access_token');
      expect(login).toHaveProperty('user');
      expect(login.user.user_name).toBe(testUserData.userName);
      expect(login.user.email).toBe(testUserData.email);
      expect(login.access_token).toBeDefined();
      expect(typeof login.access_token).toBe('string');
    });

    it('should fail to login with incorrect password', async () => {
      await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail to login with non-existent username', async () => {
      await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: 'nonexistentuser',
          password: testUserData.password,
        })
        .expect(401);
    });

    it('should fail to login with missing username', async () => {
      await request(getTestApp(app))
        .post('/auth/login')
        .send({
          password: testUserData.password,
        })
        .expect(400);
    });

    it('should fail to login with missing password', async () => {
      await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
        })
        .expect(400);
    });

    it('should fail to login with empty request body', async () => {
      await request(getTestApp(app)).post('/auth/login').send({}).expect(400);
    });
  });

  describe('POST /auth/refresh-token', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Login to get refresh token
      const loginResponse = await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: testUserData.password,
        });

      interface RefreshTokenResponse {
        refresh_token?: string;
      }
      const loginBody = loginResponse.body as RefreshTokenResponse;
      refreshToken = loginBody.refresh_token ?? 'mock-refresh-token';
    });

    it('should refresh token successfully', async () => {
      const response = await request(getTestApp(app))
        .post('/auth/refresh-token')
        .send({ refresh_token: refreshToken })
        .expect(201);

      interface RefreshResponse {
        access_token: string;
        refresh_token: string;
      }
      const refresh = response.body as RefreshResponse;
      expect(refresh).toHaveProperty('access_token');
      expect(refresh).toHaveProperty('refresh_token');
      expect(refresh.access_token).not.toBe(refreshToken);
    });

    it('should fail with invalid refresh token', async () => {
      await request(getTestApp(app))
        .post('/auth/refresh-token')
        .send({ refresh_token: 'invalid-token' })
        .expect(401);
    });

    it('should fail with missing refresh token', async () => {
      await request(getTestApp(app))
        .post('/auth/refresh-token')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Login to get access token
      const loginResponse = await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: testUserData.password,
        });

      accessToken = (loginResponse.body as { access_token: string })
        .access_token;
    });

    it('should logout successfully', async () => {
      await request(getTestApp(app))
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should fail without authorization header', async () => {
      await request(getTestApp(app)).post('/auth/logout').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(getTestApp(app))
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email successfully', async () => {
      await request(getTestApp(app))
        .post('/auth/forgot-password')
        .send({ email: testUserData.email })
        .expect(200);
    });

    it('should fail with non-existent email', async () => {
      await request(getTestApp(app))
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(getTestApp(app))
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should fail with missing email', async () => {
      await request(getTestApp(app))
        .post('/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should fail with invalid reset token', async () => {
      await request(getTestApp(app))
        .post('/auth/reset-password')
        .send({
          reset_token: 'invalid-token',
          new_password: 'newpassword123',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(getTestApp(app))
        .post('/auth/reset-password')
        .send({
          reset_token: 'mock-token',
          new_password: '123',
        })
        .expect(400);
    });

    it('should fail with missing reset token', async () => {
      await request(getTestApp(app))
        .post('/auth/reset-password')
        .send({
          new_password: 'newpassword123',
        })
        .expect(400);
    });

    it('should fail with missing new password', async () => {
      await request(getTestApp(app))
        .post('/auth/reset-password')
        .send({
          reset_token: 'mock-token',
        })
        .expect(400);
    });
  });

  describe('POST /auth/change-password', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Login to get access token
      const loginResponse = await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: testUserData.password,
        });

      accessToken = (loginResponse.body as { access_token: string })
        .access_token;
    });

    it('should fail with incorrect current password', async () => {
      await request(getTestApp(app))
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword123',
        })
        .expect(401);
    });

    it('should fail with weak new password', async () => {
      await request(getTestApp(app))
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: testUserData.password,
          new_password: '123',
        })
        .expect(400);
    });

    it('should fail without authorization', async () => {
      await request(getTestApp(app))
        .post('/auth/change-password')
        .send({
          current_password: testUserData.password,
          new_password: 'newpassword123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/validate-token', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Login to get access token
      const loginResponse = await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: testUserData.password,
        });

      accessToken = (loginResponse.body as { access_token: string })
        .access_token;
    });

    it('should validate token successfully', async () => {
      const response = await request(getTestApp(app))
        .post('/auth/validate-token')
        .send({ token: accessToken })
        .expect(200);

      const validateBody = response.body as {
        valid: boolean;
        user: { user_name: string };
      };
      expect(validateBody).toHaveProperty('valid', true);
      expect(validateBody).toHaveProperty('user');
      expect(validateBody.user.user_name).toBe(testUserData.userName);
    });

    it('should fail with invalid token', async () => {
      await request(getTestApp(app))
        .post('/auth/validate-token')
        .send({ token: 'invalid-token' })
        .expect(401);
    });

    it('should fail with missing token', async () => {
      await request(getTestApp(app))
        .post('/auth/validate-token')
        .send({})
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(getTestApp(app))
          .post('/auth/login')
          .send({
            username: testUserData.userName,
            password: 'wrongpassword',
          })
          .expect(401);
      }

      // Next attempt should be rate limited
      await request(getTestApp(app))
        .post('/auth/login')
        .send({
          username: testUserData.userName,
          password: 'wrongpassword',
        })
        .expect(429);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(getTestApp(app))
        .get('/auth/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});
