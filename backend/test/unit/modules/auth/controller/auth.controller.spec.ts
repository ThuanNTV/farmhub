import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from 'src/dto/auth/auth.dto';
import { SecurityService } from 'src/service/global/security.service';
import { AuthController } from 'src/core/auth/controller/auth.controller';
import { AuthService } from 'src/core/auth/service/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    register: jest.fn(),
  };

  const mockUser = {
    userId: '1',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'STORE_MANAGER',
    associatedStoreIds: ['store1', 'store2'],
    isSuperadmin: false,
  };

  const mockLoginResponse = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    user: mockUser,
    expires_in: 3600,
  };

  const loginDto: LoginDto = {
    usernameOrEmail: 'testuser',
    password: 'password123',
  };

  const mockRequest = {
    user: mockUser,
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    headers: { 'user-agent': 'test-agent' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: SecurityService,
          useValue: {
            isSuspiciousIP: jest.fn(),
            isLoginBlocked: jest.fn(),
            getRemainingBlockTime: jest.fn(),
            recordFailedLoginAttempt: jest.fn(),
            recordSuccessfulLogin: jest.fn(),
            createSession: jest.fn(),
            blacklistToken: jest.fn(),
            validateToken: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
            getAllAndMerge: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(
        loginDto,
        mockRequest,
        '127.0.0.1',
        'test-agent',
      );

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        'test-agent',
      );
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const error = new UnauthorizedException(
        '❌ Tên đăng nhập hoặc mật khẩu không đúng',
      );
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockUser,
        '127.0.0.1',
        'test-agent',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const error = new UnauthorizedException('❌ Tài khoản đã bị vô hiệu hóa');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
    });

    it('should throw UnauthorizedException when user is deleted', async () => {
      const error = new UnauthorizedException('❌ Tài khoản đã bị xóa');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
    });

    it('should handle missing username', async () => {
      const error = new BadRequestException(
        '❌ Tên đăng nhập không được để trống',
      );
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          { ...loginDto, usernameOrEmail: '' },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle missing password', async () => {
      const error = new BadRequestException('❌ Mật khẩu không được để trống');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          { ...loginDto, password: '' },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle service errors', async () => {
      const error = new InternalServerErrorException(
        'Authentication service unavailable',
      );
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refresh-token-123',
    };

    it('should refresh token successfully', async () => {
      const newLoginResponse = {
        ...mockLoginResponse,
        access_token: 'new-access-token-456',
        refresh_token: 'new-refresh-token-456',
      };
      mockAuthService.refreshToken.mockResolvedValue(newLoginResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(newLoginResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const error = new UnauthorizedException('❌ Refresh token không hợp lệ');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        error,
      );
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException with expired refresh token', async () => {
      const error = new UnauthorizedException('❌ Refresh token đã hết hạn');
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(controller.refreshToken(refreshTokenDto)).rejects.toThrow(
        error,
      );
    });

    it('should handle empty refresh token', async () => {
      const error = new BadRequestException(
        '❌ Refresh token không được để trống',
      );
      mockAuthService.refreshToken.mockRejectedValue(error);

      await expect(
        controller.refreshToken({ refreshToken: '' }),
      ).rejects.toThrow(error);
    });
  });

  describe('logout', () => {
    const mockLogoutRequest = {
      user: mockUser,
      headers: { authorization: 'Bearer test-token' },
    };

    it('should logout successfully', async () => {
      const expectedResponse = {
        message: '✅ Đăng xuất thành công',
        data: null,
      };
      mockAuthService.logout.mockResolvedValue(expectedResponse);

      const result = await controller.logout(mockLogoutRequest);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.logout).toHaveBeenCalledWith('test-token');
    });

    it('should handle logout errors', async () => {
      const error = new InternalServerErrorException('Logout failed');
      mockAuthService.logout.mockRejectedValue(error);

      await expect(controller.logout(mockLogoutRequest)).rejects.toThrow(error);
    });

    it('should handle missing authorization header', async () => {
      const requestWithoutAuth = {
        user: mockUser,
        headers: {},
      };

      const result = await controller.logout(requestWithoutAuth);

      expect(result).toEqual({ message: 'Đăng xuất thành công' });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send password reset email successfully', async () => {
      const expectedResponse = {
        message: '✅ Email đặt lại mật khẩu đã được gửi',
        data: null,
      };
      mockAuthService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });

    it('should throw NotFoundException when email not found', async () => {
      const error = new BadRequestException(
        '❌ Email không tồn tại trong hệ thống',
      );
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(error);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });

    it('should handle invalid email format', async () => {
      const invalidEmailDto: ForgotPasswordDto = { email: 'invalid-email' };
      const error = new BadRequestException('❌ Email không đúng định dạng');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword(invalidEmailDto)).rejects.toThrow(
        error,
      );
    });

    it('should handle empty email', async () => {
      const error = new BadRequestException('❌ Email không được để trống');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(controller.forgotPassword({ email: '' })).rejects.toThrow(
        error,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token-123',
      newPassword: 'newpassword123',
    };

    it('should reset password successfully', async () => {
      const expectedResponse = {
        message: '✅ Mật khẩu đã được đặt lại thành công',
        data: null,
      };
      mockAuthService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should throw BadRequestException with invalid reset token', async () => {
      const error = new BadRequestException(
        '❌ Token đặt lại mật khẩu không hợp lệ',
      );
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should throw BadRequestException with expired reset token', async () => {
      const error = new BadRequestException(
        '❌ Token đặt lại mật khẩu đã hết hạn',
      );
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
    });

    it('should handle weak password', async () => {
      const weakPasswordDto: ResetPasswordDto = {
        token: 'reset-token-123',
        newPassword: '123',
      };
      const error = new BadRequestException(
        '❌ Mật khẩu phải có ít nhất 6 ký tự',
      );
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(weakPasswordDto)).rejects.toThrow(
        error,
      );
    });

    it('should handle empty password', async () => {
      const error = new BadRequestException('❌ Mật khẩu không được để trống');
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(
        controller.resetPassword({ token: 'token', newPassword: '' }),
      ).rejects.toThrow(error);
    });
  });

  describe('getProfile', () => {
    it('should return the current user', () => {
      const req = { user: mockUser };
      const result = controller.getProfile(req as any);
      expect(result).toBe(mockUser);
    });
  });

  describe('register', () => {
    const createUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    it('should register a new user successfully', async () => {
      const expectedResponse = { message: 'Đăng ký thành công', data: null };
      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(createUserDto as any);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException if data is invalid', async () => {
      const error = new BadRequestException('Dữ liệu không hợp lệ');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register({} as any)).rejects.toThrow(error);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined parameters gracefully', async () => {
      const error = new BadRequestException('Invalid parameters');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          { usernameOrEmail: '', password: '' },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle very long usernames', async () => {
      const longUsername = 'a'.repeat(1000);
      const error = new BadRequestException('Username too long');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          { usernameOrEmail: longUsername, password: 'password' },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const error = new BadRequestException('Password too long');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          { usernameOrEmail: 'user', password: longPassword },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle special characters in credentials', async () => {
      const specialUsername = 'user@#$%^&*()';
      const specialPassword = 'pass@#$%^&*()';
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          {
            usernameOrEmail: specialUsername,
            password: specialPassword,
          },
          mockRequest,
          '127.0.0.1',
          'test-agent',
        ),
      ).rejects.toThrow(error);
    });

    it('should handle concurrent login attempts', async () => {
      const error = new ForbiddenException('Too many login attempts');
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
    });

    it('should handle service unavailability', async () => {
      const error = new InternalServerErrorException(
        'Service temporarily unavailable',
      );
      mockAuthService.login.mockRejectedValue(error);

      await expect(
        controller.login(loginDto, mockRequest, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(error);
    });
  });
});
