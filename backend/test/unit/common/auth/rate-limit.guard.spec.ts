import { RateLimitGuard } from '../../../../src/common/auth/rate-limit.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RateLimitGuard(reflector);
  });

  function createContext(request: any): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('trả về true nếu không có config', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext({});
    expect(guard.canActivate(context)).toBe(true);
  });

  it('cho phép request đầu tiên và reset sau windowMs', () => {
    const config = { windowMs: 100, maxRequests: 2 };
    reflector.getAllAndOverride.mockReturnValue(config);
    const req = {
      ip: '1.2.3.4',
      user: { userId: 'u1' },
      route: { path: '/a' },
    };
    const context = createContext(req);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    // Vượt quá số request
    expect(() => guard.canActivate(context)).toThrow(HttpException);
    // Đợi reset
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
    expect(guard.canActivate(context)).toBe(true);
    jest.spyOn(Date, 'now').mockRestore();
  });

  it('tạo key khác nhau cho endpoint khác nhau', () => {
    const config = { windowMs: 100, maxRequests: 1 };
    reflector.getAllAndOverride.mockReturnValue(config);
    const req1 = {
      ip: '1.2.3.4',
      user: { userId: 'u1' },
      route: { path: '/a' },
    };
    const req2 = {
      ip: '1.2.3.4',
      user: { userId: 'u1' },
      route: { path: '/b' },
    };
    const context1 = createContext(req1);
    const context2 = createContext(req2);
    expect(guard.canActivate(context1)).toBe(true);
    expect(guard.canActivate(context2)).toBe(true);
  });

  it('cleanup xóa record cũ', () => {
    const config = { windowMs: 10, maxRequests: 1 };
    reflector.getAllAndOverride.mockReturnValue(config);
    const req = {
      ip: '1.2.3.4',
      user: { userId: 'u1' },
      route: { path: '/a' },
    };
    const context = createContext(req);
    expect(guard.canActivate(context)).toBe(true);
    // Giả lập record cũ
    const now = Date.now();
    (guard as any).requestRecords.set('1.2.3.4:u1:/a', {
      count: 1,
      resetTime: now - 100,
    });
    (guard as any).cleanup();
    expect((guard as any).requestRecords.has('1.2.3.4:u1:/a')).toBe(false);
  });
});
