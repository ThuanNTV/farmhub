import { EnhancedJwtStrategy } from '../../../../src/common/auth/enhanced-jwt.strategy';
import { SecurityService } from '../../../../src/service/global/security.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../../../src/modules/users/dto/create-user.dto';

describe('EnhancedJwtStrategy', () => {
  let strategy: EnhancedJwtStrategy;
  let securityService: jest.Mocked<SecurityService>;

  beforeEach(() => {
    securityService = {
      validateToken: jest.fn().mockResolvedValue(true),
      updateSessionActivity: jest.fn().mockReturnValue(true),
      isSuspiciousIP: jest.fn().mockReturnValue(false),
    } as any;
    strategy = new EnhancedJwtStrategy(securityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const basePayload = {
    sub: 'user1',
    username: 'test',
    email: 'test@mail.com',
    role: UserRole.ADMIN_GLOBAL,
    sessionId: 'sess1',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  it('throw nếu token bị blacklist', async () => {
    securityService.validateToken.mockResolvedValue(false);
    const req: any = {
      ip: '1.2.3.4',
      get: () => 'agent',
      connection: { remoteAddress: '1.2.3.4' },
      headers: { authorization: 'Bearer token' },
    };
    await expect(strategy.validate(req, basePayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throw nếu session hết hạn', async () => {
    securityService.updateSessionActivity.mockReturnValue(false);
    const req: any = {
      ip: '1.2.3.4',
      get: () => 'agent',
      connection: { remoteAddress: '1.2.3.4' },
      headers: { authorization: 'Bearer token' },
    };
    await expect(strategy.validate(req, basePayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throw nếu IP nghi ngờ', async () => {
    securityService.isSuspiciousIP.mockReturnValue(true);
    const req: any = {
      ip: '1.2.3.4',
      get: () => 'agent',
      connection: { remoteAddress: '1.2.3.4' },
      headers: { authorization: 'Bearer token' },
    };
    await expect(strategy.validate(req, basePayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throw nếu token quá cũ', async () => {
    const oldPayload = {
      ...basePayload,
      iat: Math.floor(Date.now() / 1000) - 25 * 3600,
    };
    const req: any = {
      ip: '1.2.3.4',
      get: () => 'agent',
      connection: { remoteAddress: '1.2.3.4' },
      headers: { authorization: 'Bearer token' },
    };
    await expect(strategy.validate(req, oldPayload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('trả về user info khi hợp lệ', async () => {
    const req: any = {
      ip: '1.2.3.4',
      get: () => 'agent',
      connection: { remoteAddress: '1.2.3.4' },
      headers: { authorization: 'Bearer token' },
    };
    const result = await strategy.validate(req, basePayload);
    expect(result).toMatchObject({
      userId: basePayload.sub,
      username: basePayload.username,
      email: basePayload.email,
      role: basePayload.role,
      sessionId: basePayload.sessionId,
      tokenIssuedAt: basePayload.iat,
      tokenExpiresAt: basePayload.exp,
    });
  });
});
