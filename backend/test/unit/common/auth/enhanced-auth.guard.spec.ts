import { EnhancedAuthGuard } from '../../../../src/common/auth/enhanced-auth.guard';
import { SecurityService } from '../../../../src/service/global/security.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';

describe('EnhancedAuthGuard', () => {
  let guard: EnhancedAuthGuard;
  let securityService: jest.Mocked<SecurityService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    securityService = {
      recordFailedLoginAttempt: jest.fn(),
      recordSuccessfulLogin: jest.fn(),
    } as any;
    reflector = {} as any;
    guard = new EnhancedAuthGuard(reflector, securityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('canActivate trả về true khi super trả về true', async () => {
    const context = {} as ExecutionContext;
    // Mock super.canActivate trả về true
    guard['__proto__'].canActivate = jest.fn().mockReturnValue(true);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('canActivate trả về false khi super trả về false', async () => {
    const context = {} as ExecutionContext;
    guard['__proto__'].canActivate = jest.fn().mockReturnValue(false);
    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('canActivate trả về promise khi super trả về promise', async () => {
    const context = {} as ExecutionContext;
    guard['__proto__'].canActivate = jest
      .fn()
      .mockReturnValue(Promise.resolve(true));
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('handleRequest gọi recordFailedLoginAttempt khi lỗi', () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '1.2.3.4',
          connection: { remoteAddress: '1.2.3.4' },
        }),
      }),
    };
    expect(() =>
      guard.handleRequest(new Error('err'), null, null, context),
    ).toThrow(UnauthorizedException);
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
      '1.2.3.4',
    );
  });

  it('handleRequest gọi recordFailedLoginAttempt khi không có user', () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '1.2.3.4',
          connection: { remoteAddress: '1.2.3.4' },
        }),
      }),
    };
    expect(() => guard.handleRequest(null, null, null, context)).toThrow(
      UnauthorizedException,
    );
    expect(securityService.recordFailedLoginAttempt).toHaveBeenCalledWith(
      '1.2.3.4',
    );
  });

  it('handleRequest gọi recordSuccessfulLogin khi có user', () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '1.2.3.4',
          connection: { remoteAddress: '1.2.3.4' },
        }),
      }),
    };
    const user = { userId: '1' };
    const result = guard.handleRequest(null, user, null, context);
    expect(securityService.recordSuccessfulLogin).toHaveBeenCalledWith(
      '1.2.3.4',
    );
    expect(result).toBe(user);
  });
});
