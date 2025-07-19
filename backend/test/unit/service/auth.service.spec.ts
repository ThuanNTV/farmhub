/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/core/user/service/users.service';
import { CreateUserDto, UserRole } from 'src/modules/users/dto/create-user.dto';
import { AuthService } from 'src/core/auth/service/auth.service';
import { SecurityService } from 'src/service/global/security.service';
import { SafeUser } from 'src/dto/auth/auth.dto';

// Mock bcrypt to make tests deterministic
jest.mock('bcryptjs', () => ({
  compare: jest.fn((plain, hash) => {
    // Simulate correct password
    if (plain === 'password123' && hash) return Promise.resolve(true);
    // Simulate wrong password
    return Promise.resolve(false);
  }),
  hash: jest.fn((plain) => Promise.resolve(`hashed_${plain}`)),
}));

// Khai báo các biến mock ở scope ngoài cùng
let service: AuthService;
let usersService: jest.Mocked<UsersService>;
let jwtService: jest.Mocked<JwtService>;
let securityService: jest.Mocked<SecurityService>;
let mockSafeUser: SafeUser;
let mockUser: any;

describe('AuthService', () => {
  beforeEach(async () => {
    mockUser = {
      user_id: 'user-123',
      user_name: 'testuser',
      full_name: 'Test User',
      email: 'test@example.com',
      role: UserRole.STORE_STAFF,
      password_hash:
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hash of 'password123'
      is_active: true,
      is_deleted: false,
      is_superadmin: false,
      last_login_at: new Date(),
      password_reset_token: undefined,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockSafeUser = {
      userId: 'user-123',
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      role: UserRole.STORE_STAFF,
      associatedStoreIds: [],
      isSuperadmin: false,
    };
    const mockUsersService = {
      findOneUsernameOrEmail: jest.fn(
        (usernameOrEmail: string): Promise<typeof mockUser | null> => {
          return usernameOrEmail === 'testuser'
            ? Promise.resolve(mockUser)
            : Promise.resolve(null);
        },
      ),
      updateLastLogin: jest.fn(),
      createUser: jest.fn(),
      findOneById: jest.fn(),
      updateResetToken: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };

    const mockSecurityService = {
      isSuspiciousIP: jest.fn(),
      isLoginBlocked: jest.fn(),
      getRemainingBlockTime: jest.fn(),
      recordFailedLoginAttempt: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
      createSession: jest.fn(),
      blacklistToken: jest.fn(),
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
    jwtService = module.get(JwtService);
    securityService = module.get(SecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user successfully with correct credentials', async () => {
      usersService.findOneUsernameOrEmail.mockResolvedValue(mockUser);
      securityService.isSuspiciousIP.mockReturnValue(false);
      securityService.isLoginBlocked.mockReturnValue(false);

      const result = await service.validateUser(
        'testuser',
        'password123',
        '192.168.1.1',
      );

      expect(result).toMatchObject(mockSafeUser);
      expect(usersService.findOneUsernameOrEmail).toHaveBeenCalledWith(
        'testuser',
      );
      expect(securityService.recordSuccessfulLogin).toHaveBeenCalledWith(
        '192.168.1.1',
      );
      expect(securityService.recordSuccessfulLogin).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      usersService.findOneUsernameOrEmail.mockResolvedValue(null);
      securityService.isSuspiciousIP.mockReturnValue(false);
      securityService.isLoginBlocked.mockReturnValue(false);

      const result = await service.validateUser(
        'nonexistent',
        'password123',
        '192.168.1.1',
      );

      expect(result).toBeNull();
      expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
        '192.168.1.1',
      );
      expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      const deletedUser = { ...mockUser, is_deleted: true };
      usersService.findOneUsernameOrEmail.mockResolvedValue(deletedUser);
      securityService.isSuspiciousIP.mockReturnValue(false);
      securityService.isLoginBlocked.mockReturnValue(false);

      await expect(
        service.validateUser('testuser', 'password123', '192.168.1.1'),
      ).rejects.toThrow('Tài khoản không hoạt động hoặc đã bị xoá');
      expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
        '192.168.1.1',
      );
      expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
    });
  });

  it('should throw UnauthorizedException for blocked IP', async () => {
    securityService.isSuspiciousIP.mockReturnValue(false);
    securityService.isLoginBlocked.mockReturnValue(true);
    securityService.getRemainingBlockTime.mockReturnValue(60000);
    await expect(
      service.validateUser('testuser', 'password123', '192.168.1.1'),
    ).rejects.toThrow(UnauthorizedException);
    expect(securityService.isLoginBlocked).toHaveBeenCalledWith('192.168.1.1');
    expect(securityService.isLoginBlocked).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException for inactive user', async () => {
    const inactiveUser = { ...mockUser, is_active: false };
    usersService.findOneUsernameOrEmail.mockResolvedValue(inactiveUser);
    securityService.isSuspiciousIP.mockReturnValue(false);
    securityService.isLoginBlocked.mockReturnValue(false);
    await expect(
      service.validateUser('testuser', 'password123', '192.168.1.1'),
    ).rejects.toThrow(UnauthorizedException);
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
      '192.168.1.1',
    );
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
  });

  it('should return null for incorrect password and record failed login', async () => {
    usersService.findOneUsernameOrEmail.mockResolvedValue(mockUser);
    securityService.isSuspiciousIP.mockReturnValue(false);
    securityService.isLoginBlocked.mockReturnValue(false);

    const result = await service.validateUser(
      'testuser',
      'wrongpassword',
      '192.168.1.1',
    );

    expect(result).toBeNull();
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
      '192.168.1.1',
    );
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledTimes(1);
  });

  it('should work without clientIP parameter', async () => {
    usersService.findOneUsernameOrEmail.mockResolvedValue(mockUser);

    const result = await service.validateUser('testuser', 'password123');

    expect(result).toMatchObject(mockSafeUser);
    expect(securityService.isSuspiciousIP).not.toHaveBeenCalled();
    expect(securityService.isLoginBlocked).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('should login successfully and return access token', async () => {
    const mockToken = 'mock.jwt.token';
    const _ = 'session_1234567890_abc123';

    usersService.updateLastLogin.mockResolvedValue({
      message: 'Updated',
      data: null,
    });
    jwtService.sign.mockReturnValue(mockToken);

    const result = await service.login(
      mockSafeUser,
      '192.168.1.1',
      'Mozilla/5.0',
    );

    expect(result).toEqual({
      message: '🎉 Đăng nhập thành công!',
      data: {
        access_token: mockToken,
        user: mockSafeUser,
        sessionId: expect.stringMatching(/^session_\d+_[a-z0-9]+$/),
      },
    });
    expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-123');
    expect(securityService.createSession).toHaveBeenCalledWith(
      'user-123',
      expect.stringMatching(/^session_\d+_[a-z0-9]+$/),
      '192.168.1.1',
      'Mozilla/5.0',
    );
    // Kiểm tra payload thực tế truyền vào jwtService.sign
    const [payload, options] = jwtService.sign.mock.calls[0];
    expect(payload).toMatchObject({
      username: 'testuser',
      sub: 'user-123',
      role: UserRole.STORE_STAFF,
    });
    expect(options).toEqual({ expiresIn: '1h' });
    expect(usersService.updateLastLogin).toHaveBeenCalledTimes(1);
    expect(securityService.createSession).toHaveBeenCalledTimes(1);
  });
});

it('should login without creating session when IP and userAgent are not provided', async () => {
  jest.clearAllMocks();
  const mockToken = 'mock.jwt.token';

  usersService.updateLastLogin.mockResolvedValue({
    message: 'Updated',
    data: null,
  });
  jwtService.sign.mockReturnValue(mockToken);

  const result = await service.login(mockSafeUser);

  expect(result.data.sessionId).toBeDefined();
  expect(typeof result.data.sessionId).toBe('string');
  expect(securityService.createSession).not.toHaveBeenCalled();
});

describe('logout', () => {
  it('should logout successfully and blacklist token', async () => {
    const token = 'mock.jwt.token';

    const result = await service.logout(token);

    expect(result).toEqual({ message: 'Đăng xuất thành công' });
    expect(securityService.blacklistToken).toHaveBeenCalledWith(
      token,
      'User logout',
    );
    expect(securityService.blacklistToken).toHaveBeenCalledTimes(1);
  });
});

describe('register', () => {
  it('should register user successfully', async () => {
    const createUserDto: CreateUserDto = {
      userName: 'newuser',
      fullName: 'New User',
      password: 'password123',
      email: 'newuser@example.com',
      role: UserRole.STORE_STAFF,
    };

    const createdUser = { ...mockUser, user_name: 'newuser' };
    usersService.createUser.mockResolvedValue(createdUser);

    const result = await service.register(createUserDto);

    expect(result).toEqual(createdUser);
    expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    expect(usersService.createUser).toHaveBeenCalledTimes(1);
  });
});

describe('forgotPassword', () => {
  it('should send password reset token to email', async () => {
    const email = 'test@example.com';
    const mockToken = 'mock.reset.token';

    usersService.findOneUsernameOrEmail.mockResolvedValue(mockUser);
    jwtService.sign.mockReturnValue(mockToken);
    usersService.updateResetToken.mockResolvedValue({
      message: 'Updated',
      data: null,
    });

    const result = await service.forgotPassword(email);

    expect(result).toEqual({ message: 'Password reset token sent to email' });
    expect(usersService.findOneUsernameOrEmail).toHaveBeenCalledWith(email);
    expect(jwtService.sign).toHaveBeenCalledWith(
      { user_id: 'user-123', type: 'reset' },
      { expiresIn: '15m' },
    );
    expect(usersService.updateResetToken).toHaveBeenCalledWith(
      'user-123',
      mockToken,
    );
    expect(usersService.updateResetToken).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException when user not found', async () => {
    usersService.findOneUsernameOrEmail.mockResolvedValue(null);
    await expect(service.forgotPassword('test@example.com')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(usersService.findOneUsernameOrEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });
});

describe('resetPassword', () => {
  it('should throw UnauthorizedException for invalid token type', async () => {
    const token = 'invalid.token';
    const mockPayload = { userId: 'user-123', type: 'invalid' };
    jwtService.verify.mockReturnValue(mockPayload);
    await expect(
      service.resetPassword(token, 'newPassword123'),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verify).toHaveBeenCalledWith(token);
  });

  it('should throw UnauthorizedException when reset token does not match', async () => {
    const token = 'mock.reset.token';
    jwtService.verify.mockReturnValue({ userId: 'user-123', type: 'reset' });
    usersService.findOneById.mockResolvedValue({
      ...mockUser,
      password_reset_token: 'different.token',
    });
    await expect(
      service.resetPassword(token, 'newPassword123'),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verify).toHaveBeenCalledWith(token);
    expect(usersService.findOneById).toHaveBeenCalledWith('user-123');
    expect(usersService.updatePassword).not.toHaveBeenCalled();
  });
});

describe('refreshToken', () => {
  it('should refresh token successfully', async () => {
    const refreshToken = 'valid.refresh.token';
    const mockPayload = {
      userId: 'user-123',
      type: 'refresh',
      sessionId: 'session123',
    };
    const mockAccessToken = 'new.access.token';
    const mockRefreshToken = 'new.refresh.token';
    jwtService.verify.mockReturnValue(mockPayload);
    usersService.findOneById.mockResolvedValue(mockUser);
    jwtService.sign
      .mockReturnValueOnce(mockAccessToken)
      .mockReturnValueOnce(mockRefreshToken);
    const result = await service.refreshToken(refreshToken);
    expect(result).toEqual({
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
    });
    expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
    expect(usersService.findOneById).toHaveBeenCalledWith('user-123');
  });

  it('should throw UnauthorizedException for invalid refresh token', async () => {
    const refreshToken = 'invalid.refresh.token';
    const mockPayload = { userId: 'user-123', type: 'invalid' };
    jwtService.verify.mockReturnValue(mockPayload);
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
  });

  it('should throw UnauthorizedException when user not found', async () => {
    const refreshToken = 'valid.refresh.token';
    const mockPayload = { userId: 'user-123', type: 'refresh' };
    jwtService.verify.mockReturnValue(mockPayload);
    usersService.findOneById.mockRejectedValue(new Error('User not found'));
    await expect(service.refreshToken(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(usersService.findOneById).toHaveBeenCalledWith('user-123');
  });
});
