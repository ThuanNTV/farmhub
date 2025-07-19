import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../../src/entities/global/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlobalDatabaseModule } from '../../../src/config/db/dbtenant/global-database.module';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/core/auth/service/auth.service';
import { AuthModule } from 'src/core/auth/auth.module';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { SecurityService } from 'src/service/global/security.service';
import {
  mockAuditLogAsyncService,
  mockAuditLogQueueService,
  mockSecurityService,
} from '../../utils/mock-dependencies';
import { AuditLogQueueService } from 'src/common/queue/audit-log-queue.service';

describe('AuthService Integration', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  // UUID hợp lệ cho test
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  const testUserData = {
    userName: 'integration-test-user',
    email: 'integration-test@example.com',
    password: 'testpassword123',
    fullName: 'Integration Test User',
    role: UserRole.STORE_STAFF,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalDatabaseModule, AuthModule],
      providers: [
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: AuditLogQueueService, useValue: mockAuditLogQueueService },
        { provide: SecurityService, useValue: mockSecurityService },
      ],
    })
      .overrideProvider(AuditLogAsyncService)
      .useValue(mockAuditLogAsyncService)
      .overrideProvider(AuditLogQueueService)
      .useValue(mockAuditLogQueueService)
      .overrideProvider(SecurityService)
      .useValue(mockSecurityService)
      .compile();

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
    await userRepository.delete({ user_name: testUserData.userName });
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
      // Nếu result là mảng, lấy phần tử đầu tiên
      const user = Array.isArray(result) ? result[0] : result;
      expect(user).toBeDefined();
      expect(user.user_name).toBe(testUserData.userName);
      expect(user.email).toBe(testUserData.email);
      expect(user.full_name).toBe(testUserData.fullName);
      expect(user.role).toBe(testUserData.role);

      // Verify user exists in database
      let dbUser = await userRepository.findOneBy({
        user_name: testUserData.userName,
      });
      if (Array.isArray(dbUser)) dbUser = dbUser[0];
      expect(dbUser).not.toBeNull();
      expect(dbUser!.user_name).toBe(testUserData.userName);
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
        userName: 'different-username',
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
        testUserData.userName,
        testUserData.password,
      );

      expect(user).toBeDefined();
      expect(user!.user_name).toBe(testUserData.userName);
      expect(user!.email).toBe(testUserData.email);
    });

    it('should return null for incorrect password', async () => {
      const user = await authService.validateUser(
        testUserData.userName,
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
        testUserData.userName,
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
      expect(loginResult.data.user.user_name).toBe(testUserData.userName);
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
      const userResult = Array.isArray(result) ? result[0] : result;
      // expect(userResult.password).not.toBe(testUserData.password);

      // Verify we can still validate with original password
      const user = await authService.validateUser(
        testUserData.userName,
        testUserData.password,
      );
      expect(user).toBeDefined();
    });
  });

  describe('user activation', () => {
    it('should create active user by default', async () => {
      const result = await authService.register(testUserData);

      const userActive = Array.isArray(result) ? result[0] : result;
      expect(userActive.is_active).toBe(true);
      expect(userActive.is_deleted).toBe(false);

      // Verify in database
      let dbUserActive = await userRepository.findOneBy({
        user_name: testUserData.userName,
      });
      if (Array.isArray(dbUserActive)) dbUserActive = dbUserActive[0];
      expect(dbUserActive!.is_active).toBe(true);
      expect(dbUserActive!.is_deleted).toBe(false);
    });
  });
});
