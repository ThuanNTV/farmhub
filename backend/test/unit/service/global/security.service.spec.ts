import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { SecurityService } from 'src/service/global/security.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-token';
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });

      const result = await service.validateToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const token = 'invalid-token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const result = await service.validateToken(token);

      expect(result).toBe(false);
    });

    it('should return false for blacklisted token', async () => {
      const token = 'blacklisted-token';
      service.blacklistToken(token, 'User logout');

      const result = await service.validateToken(token);

      expect(result).toBe(false);
    });

    it('should return false when JWT verification throws UnauthorizedException', async () => {
      const token = 'blacklisted-token';
      mockJwtService.verifyAsync.mockRejectedValue(
        new UnauthorizedException('Token đã bị vô hiệu hóa'),
      );

      const result = await service.validateToken(token);

      expect(result).toBe(false);
    });

    it('should return false when JWT verification throws any other error', async () => {
      const token = 'malformed-token';
      mockJwtService.verifyAsync.mockRejectedValue(
        new SyntaxError('Invalid JSON'),
      );

      const result = await service.validateToken(token);

      expect(result).toBe(false);
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist token with decoded expiration', () => {
      const token = 'test-token';
      const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour from now
      mockJwtService.decode.mockReturnValue(decodedToken);

      service.blacklistToken(token, 'User logout');

      expect(mockJwtService.decode).toHaveBeenCalledWith(token);
    });

    it('should blacklist token with default expiration when decode fails', () => {
      const token = 'test-token';
      mockJwtService.decode.mockImplementation(() => {
        throw new Error('Decode failed');
      });

      service.blacklistToken(token, 'User logout');

      expect(mockJwtService.decode).toHaveBeenCalledWith(token);
    });

    it('should blacklist token with default expiration when no exp field', () => {
      const token = 'test-token';
      mockJwtService.decode.mockReturnValue({ sub: 'user-1' }); // No exp field

      service.blacklistToken(token, 'User logout');

      expect(mockJwtService.decode).toHaveBeenCalledWith(token);
    });
  });

  describe('Session Management', () => {
    it('should create session successfully', () => {
      const userId = 'user-1';
      const sessionId = 'session-1';
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      service.createSession(userId, sessionId, ip, userAgent);

      const sessions = service.getUserSessions(userId);
      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual({
        userId: 'user-1',
        sessionId: 'session-1',
        lastActivity: expect.any(Number),
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
    });

    it('should update session activity', () => {
      const userId = 'user-1';
      const sessionId = 'session-1';
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      service.createSession(userId, sessionId, ip, userAgent);
      const originalTime = Date.now();

      // Wait a bit to ensure time difference
      setTimeout(() => {
        const result = service.updateSessionActivity(sessionId);
        expect(result).toBe(true);
      }, 10);
    });

    it('should return false when updating non-existent session', () => {
      const result = service.updateSessionActivity('non-existent-session');
      expect(result).toBe(false);
    });

    it('should remove session successfully', () => {
      const userId = 'user-1';
      const sessionId = 'session-1';
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      service.createSession(userId, sessionId, ip, userAgent);
      expect(service.getUserSessions(userId)).toHaveLength(1);

      service.removeSession(sessionId);
      expect(service.getUserSessions(userId)).toHaveLength(0);
    });

    it('should get user sessions correctly', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';
      const ip = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      service.createSession(userId1, sessionId1, ip, userAgent);
      service.createSession(userId2, sessionId2, ip, userAgent);

      const user1Sessions = service.getUserSessions(userId1);
      const user2Sessions = service.getUserSessions(userId2);

      expect(user1Sessions).toHaveLength(1);
      expect(user2Sessions).toHaveLength(1);
      expect(user1Sessions[0].userId).toBe(userId1);
      expect(user2Sessions[0].userId).toBe(userId2);
    });
  });

  describe('Login Security', () => {
    it('should record failed login attempts', () => {
      const identifier = 'user@example.com';

      service.recordFailedLoginAttempt(identifier);
      service.recordFailedLoginAttempt(identifier);
      service.recordFailedLoginAttempt(identifier);

      expect(service.isLoginBlocked(identifier)).toBe(false);
    });

    it('should block login after 5 failed attempts', () => {
      const identifier = 'user@example.com';

      // Record 5 failed attempts
      for (let i = 0; i < 5; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      expect(service.isLoginBlocked(identifier)).toBe(true);
    });

    it('should record successful login and reset failed attempts', () => {
      const identifier = 'user@example.com';

      // Record 3 failed attempts
      for (let i = 0; i < 3; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      expect(service.isLoginBlocked(identifier)).toBe(false);

      // Record successful login
      service.recordSuccessfulLogin(identifier);

      // Try to block again
      for (let i = 0; i < 5; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      expect(service.isLoginBlocked(identifier)).toBe(true);
    });

    it('should return remaining block time', () => {
      const identifier = 'user@example.com';

      // Record 5 failed attempts to trigger block
      for (let i = 0; i < 5; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      const remainingTime = service.getRemainingBlockTime(identifier);
      expect(remainingTime).toBeGreaterThan(0);
    });

    it('should return 0 remaining time for non-blocked user', () => {
      const identifier = 'user@example.com';

      const remainingTime = service.getRemainingBlockTime(identifier);
      expect(remainingTime).toBe(0);
    });

    it('should handle login block expiration correctly', () => {
      const identifier = 'user@example.com';

      // Record 5 failed attempts to trigger block
      for (let i = 0; i < 5; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      // Initially should be blocked
      expect(service.isLoginBlocked(identifier)).toBe(true);

      // Simulate time passing (manually trigger cleanup)
      // Note: In real scenario, this would happen via setInterval
      // For testing, we'll just verify the logic
      const attempts = (service as any).failedLoginAttempts.get(identifier);
      if (attempts && attempts.blockedUntil) {
        attempts.blockedUntil = Date.now() - 1000; // Set to past time
      }

      // Should not be blocked anymore
      expect(service.isLoginBlocked(identifier)).toBe(false);
    });

    it('should handle multiple failed attempts without blocking', () => {
      const identifier = 'user@example.com';

      // Record 4 failed attempts (below threshold)
      for (let i = 0; i < 4; i++) {
        service.recordFailedLoginAttempt(identifier);
      }

      expect(service.isLoginBlocked(identifier)).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should validate strong password', () => {
      const strongPassword = 'StrongPass123!';

      const result = service.validatePasswordStrength(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const weakPassword = 'Short1!';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should reject password without uppercase letter', () => {
      const weakPassword = 'lowercase123!';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 1 chữ hoa');
    });

    it('should reject password without lowercase letter', () => {
      const weakPassword = 'UPPERCASE123!';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 1 chữ thường');
    });

    it('should reject password without number', () => {
      const weakPassword = 'NoNumbers!';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 1 số');
    });

    it('should reject password without special character', () => {
      const weakPassword = 'NoSpecialChar123';

      const result = service.validatePasswordStrength(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Mật khẩu phải có ít nhất 1 ký tự đặc biệt',
      );
    });

    it('should return multiple errors for very weak password', () => {
      const veryWeakPassword = 'weak';

      const result = service.validatePasswordStrength(veryWeakPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 1 chữ hoa');
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 1 số');
      expect(result.errors).toContain(
        'Mật khẩu phải có ít nhất 1 ký tự đặc biệt',
      );
    });
  });

  describe('IP Security', () => {
    it('should identify suspicious private IPs', () => {
      const privateIPs = [
        '10.0.0.1',
        '192.168.1.1',
        '172.16.0.1',
        '172.20.0.1',
        '172.30.0.1',
        '127.0.0.1',
        '0.0.0.0',
      ];

      privateIPs.forEach((ip) => {
        expect(service.isSuspiciousIP(ip)).toBe(true);
      });
    });

    it('should identify more suspicious private IPs', () => {
      const additionalPrivateIPs = ['169.254.1.1', '::1', 'fc00::1', 'fe80::1'];

      additionalPrivateIPs.forEach((ip) => {
        expect(service.isSuspiciousIP(ip)).toBe(true);
      });
    });

    it('should not flag public IPs as suspicious', () => {
      const publicIPs = ['8.8.8.8', '1.1.1.1', '208.67.222.222'];

      publicIPs.forEach((ip) => {
        expect(service.isSuspiciousIP(ip)).toBe(false);
      });
    });

    it('should handle edge cases for IP validation', () => {
      const edgeCases = [
        '172.15.0.1', // Not in 172.16-31 range
        '172.32.0.1', // Not in 172.16-31 range
        '192.167.1.1', // Not 192.168
        '192.169.1.1', // Not 192.168
      ];

      edgeCases.forEach((ip) => {
        expect(service.isSuspiciousIP(ip)).toBe(false);
      });
    });
  });

  describe('Security Report', () => {
    it('should generate security report', () => {
      // Create some sessions
      service.createSession(
        'user-1',
        'session-1',
        '192.168.1.1',
        'Mozilla/5.0',
      );
      service.createSession(
        'user-2',
        'session-2',
        '192.168.1.2',
        'Mozilla/5.0',
      );

      // Blacklist some tokens
      service.blacklistToken('token-1', 'User logout');
      service.blacklistToken('token-2', 'Security violation');

      // Block some users
      for (let i = 0; i < 5; i++) {
        service.recordFailedLoginAttempt('blocked-user@example.com');
      }

      const report = service.getSecurityReport();

      expect(report).toEqual({
        activeSessions: 2,
        blacklistedTokens: 2,
        blockedUsers: 1,
      });
    });
  });
});
