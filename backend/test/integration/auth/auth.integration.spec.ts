import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from '../../../src/modules/auth/service/auth.service';
import { User } from '../../../src/entities/global/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlobalDatabaseModule } from '../../../src/config/db/dbtenant/global-database.module';
import { AuthModule } from '../../../src/modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AuthService Integration', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // UUID hợp lệ cho test
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  const testUserData = {
    user_name: 'integration-test-user',
    email: 'integration-test@example.com',
    password: 'testpassword123',
    full_name: 'Integration Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalDatabaseModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User, 'globalConnection'),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.delete({ user_name: testUserData.user_name });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Register new user
      const result = await authService.register(testUserData);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.user_name).toBe(testUserData.user_name);
      expect(result.email).toBe(testUserData.email);
      expect(result.full_name).toBe(testUserData.full_name);
      expect(result.password).not.toBe(testUserData.password); // Should be hashed

      // Verify user exists in database
      const dbUser = await userRepository.findOneBy({
        user_name: testUserData.user_name,
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser!.user_name).toBe(testUserData.user_name);
      expect(dbUser!.email).toBe(testUserData.email);
      expect(dbUser!.is_active).toBe(true);
      expect(dbUser!.is_deleted).toBe(false);
    });

    it('should fail to register duplicate username', async () => {
      // Register first user
      await authService.register(testUserData);

      // Try to register with same username
      await expect(authService.register(testUserData)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should fail to register duplicate email', async () => {
      // Register first user
      await authService.register(testUserData);

      // Try to register with same email but different username
      const duplicateEmailData = {
        ...testUserData,
        user_name: 'different-username',
      };

      await expect(authService.register(duplicateEmailData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    beforeEach(async () => {
      // Create test user
      await authService.register(testUserData);
    });

    it('should validate user with correct credentials', async () => {
      const user = await authService.validateUser(
        testUserData.user_name,
        testUserData.password,
      );

      expect(user).toBeDefined();
      expect(user!.user_name).toBe(testUserData.user_name);
      expect(user!.email).toBe(testUserData.email);
    });

    it('should return null for incorrect password', async () => {
      const user = await authService.validateUser(
        testUserData.user_name,
        'wrongpassword',
      );

      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const user = await authService.validateUser(
        'nonexistentuser',
        testUserData.password,
      );

      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user
      await authService.register(testUserData);
    });

    it('should login successfully and return tokens', async () => {
      const user = await authService.validateUser(
        testUserData.user_name,
        testUserData.password,
      );

      expect(user).toBeDefined();

      const loginResult = await authService.login(
        user!,
        '127.0.0.1',
        'test-agent',
      );

      expect(loginResult).toBeDefined();
      expect(loginResult).toHaveProperty('access_token');
      expect(loginResult).toHaveProperty('user');
      expect(loginResult.user.user_name).toBe(testUserData.user_name);
    });

    it('should throw NotFoundException for null user', async () => {
      await expect(
        authService.login(null as any, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('password hashing', () => {
    it('should hash password during registration', async () => {
      const result = await authService.register(testUserData);

      // Verify password is hashed
      expect(result.password).not.toBe(testUserData.password);
      expect(result.password.length).toBeGreaterThan(20); // bcrypt hash is long

      // Verify we can still validate with original password
      const user = await authService.validateUser(
        testUserData.user_name,
        testUserData.password,
      );
      expect(user).toBeDefined();
    });
  });

  describe('user activation', () => {
    it('should create active user by default', async () => {
      const result = await authService.register(testUserData);

      expect(result.is_active).toBe(true);
      expect(result.is_deleted).toBe(false);

      // Verify in database
      const dbUser = await userRepository.findOneBy({
        user_name: testUserData.user_name,
      });
      expect(dbUser!.is_active).toBe(true);
      expect(dbUser!.is_deleted).toBe(false);
    });
  });
});
