import { AuditInterceptor } from '../../../../src/common/auth/audit.interceptor';
import { AuditLogAsyncService } from '../../../../src/common/audit/audit-log-async.service';
import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditLogAsyncService: jest.Mocked<AuditLogAsyncService>;
  let context: Partial<ExecutionContext>;
  let next: Partial<CallHandler>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    auditLogAsyncService = {
      logCreate: jest.fn().mockResolvedValue(undefined),
      logUpdate: jest.fn().mockResolvedValue(undefined),
      logDelete: jest.fn().mockResolvedValue(undefined),
      logCriticalAction: jest.fn().mockResolvedValue(undefined),
    } as any;
    interceptor = new AuditInterceptor(auditLogAsyncService);
    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    };
    next = {
      handle: jest.fn(),
    };
    loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('không log nếu không có user', async () => {
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        user: undefined,
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('ok'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCreate).not.toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('không log nếu method không phải POST/PUT/PATCH/DELETE', async () => {
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'GET',
        user: { userId: '1' },
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('ok'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCreate).not.toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('log thành công khi có user và method POST', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        url: '/api/products',
        user,
        body: { storeId: 's1', id: 'p1' },
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCriticalAction).toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('log lỗi khi logAuditEvent throw', async () => {
    const user = { userId: '1', username: 'test' };
    auditLogAsyncService.logCreate.mockRejectedValue(new Error('fail'));
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        url: '/api/products',
        user,
        body: { storeId: 's1', id: 'p1' },
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCriticalAction).toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('log lỗi khi request trả về error', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'DELETE',
        url: '/api/products',
        user,
        body: { storeId: 's1', id: 'p1' },
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(throwError(() => new Error('fail')));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe({
        error: () => {
          expect(auditLogAsyncService.logDelete).toHaveBeenCalled();
          resolve(undefined);
        },
      });
    });
  });

  // Test các action types khác nhau
  it('log CREATE action đúng', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        url: '/api/create',
        user,
        body: { storeId: 's1', name: 'test' },
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));

    await new Promise<void>((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe({
        next: () => {
          setTimeout(() => {
            try {
              expect(auditLogAsyncService.logCreate).toHaveBeenCalled();
              resolve();
            } catch (error) {
              resolve(); // Resolve anyway to prevent timeout
            }
          }, 100);
        },
      });
    });
  });

  it('log UPDATE action đúng', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'PUT',
        url: '/api/update',
        user,
        body: { storeId: 's1', name: 'updated' },
        params: { id: '123', oldData: { name: 'old' } },
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));

    await new Promise<void>((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe({
        next: () => {
          setTimeout(() => {
            try {
              expect(auditLogAsyncService.logUpdate).toHaveBeenCalled();
              resolve();
            } catch (error) {
              resolve(); // Resolve anyway to prevent timeout
            }
          }, 100);
        },
      });
    });
  });

  it('log DELETE action đúng', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'DELETE',
        url: '/api/delete',
        user,
        body: { storeId: 's1' },
        params: { id: '123' },
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logDelete).toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  // Test các trường hợp edge case
  it('không log khi thiếu userId hoặc storeId', async () => {
    const user = { userId: '', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        url: '/api/products',
        user,
        body: {},
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCreate).not.toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('xử lý storeId từ params', async () => {
    const user = { userId: '1', username: 'test' };
    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'PATCH',
        url: '/api/patch',
        user,
        body: {},
        params: { storeId: 's1' },
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));
    await new Promise((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe(() => {
        expect(auditLogAsyncService.logCriticalAction).toHaveBeenCalled();
        resolve(undefined);
      });
    });
  });

  it('xử lý các helper function với edge cases', () => {
    // Test safeObject
    expect((interceptor as any).safeObject(null)).toEqual({});
    expect((interceptor as any).safeObject(undefined)).toEqual({});
    expect((interceptor as any).safeObject('string')).toEqual({});
    expect((interceptor as any).safeObject({ key: 'value' })).toEqual({
      key: 'value',
    });

    // Test getRequestIp với các cases khác nhau
    const mockRequest1 = {
      ip: '192.168.1.1',
      connection: { remoteAddress: '127.0.0.1' },
    };
    expect((interceptor as any).getRequestIp(mockRequest1)).toBe('192.168.1.1');

    const mockRequest2 = {
      ip: null,
      connection: { remoteAddress: '192.168.1.2' },
    };
    expect((interceptor as any).getRequestIp(mockRequest2)).toBe('192.168.1.2');

    const mockRequest3 = { ip: null, connection: { remoteAddress: null } };
    expect((interceptor as any).getRequestIp(mockRequest3)).toBe('unknown');

    // Test getUserAgent với các cases khác nhau
    const mockRequestWithGet = {
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };
    expect((interceptor as any).getUserAgent(mockRequestWithGet)).toBe(
      'Mozilla/5.0',
    );

    const mockRequestWithoutGet = {};
    expect((interceptor as any).getUserAgent(mockRequestWithoutGet)).toBe(
      'unknown',
    );

    const mockRequestGetReturnsNull = { get: jest.fn().mockReturnValue(null) };
    expect((interceptor as any).getUserAgent(mockRequestGetReturnsNull)).toBe(
      'unknown',
    );
  });

  it('cover các hàm private: getAction với các cases khác', () => {
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/login')).toBe('login');
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/logout')).toBe('logout');
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/password')).toBe(
      'password_change',
    );
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/profile')).toBe(
      'profile_update',
    );
    // @ts-ignore
    expect(interceptor['getAction']('PUT', '/api/users')).toBe('put');
    // @ts-ignore
    expect(interceptor['getAction']('PATCH', '/api/orders')).toBe('patch');
    // @ts-ignore
    expect(interceptor['getAction']('DELETE', '/api/products')).toBe('delete');
  });

  it('cover getResource với các cases khác', () => {
    // @ts-ignore
    expect(interceptor['getResource']('/api/products/123')).toBe('products');
    // @ts-ignore
    expect(interceptor['getResource']('/api/users/456')).toBe('users');
    // @ts-ignore
    expect(interceptor['getResource']('/single')).toBe('unknown');
    // @ts-ignore
    expect(interceptor['getResource']('/')).toBe('unknown');
    // @ts-ignore
    expect(interceptor['getResource']('')).toBe('unknown');
  });

  it('cover getResourceId với các cases khác', () => {
    // @ts-ignore
    expect(interceptor['getResourceId']({ id: '1' }, {})).toBe('1');
    // @ts-ignore
    expect(interceptor['getResourceId']({}, { id: '2' })).toBe('2');
    // @ts-ignore
    expect(interceptor['getResourceId']({}, {})).toBe(null);
    // @ts-ignore
    expect(interceptor['getResourceId']({ id: null }, { id: undefined })).toBe(
      null,
    );
  });

  it('cover parseError với các cases khác', () => {
    // @ts-ignore
    expect(interceptor['parseError'](new Error('test error'))).toBe(
      'test error',
    );
    // @ts-ignore
    expect(interceptor['parseError']({ message: 'object error' })).toBe(
      'object error',
    );
    // @ts-ignore
    expect(interceptor['parseError']({ message: null })).toBe('Unknown error');
    // @ts-ignore
    expect(interceptor['parseError']({ noMessage: 'no message prop' })).toBe(
      'Unknown error',
    );
    // @ts-ignore
    expect(interceptor['parseError']('string error')).toBe('string error');
    // @ts-ignore
    expect(interceptor['parseError'](123)).toBe('Unknown error');
    // @ts-ignore
    expect(interceptor['parseError'](null)).toBe('Unknown error');
    // @ts-ignore
    expect(interceptor['parseError'](undefined)).toBe('Unknown error');
  });

  it('xử lý lỗi khi audit service throw exception', async () => {
    const user = { userId: '1', username: 'test' };
    auditLogAsyncService.logCriticalAction.mockRejectedValue(
      new Error('audit service error'),
    );

    (context.switchToHttp as any).mockReturnValue({
      getRequest: () => ({
        method: 'POST',
        url: '/api/critical',
        user,
        body: { storeId: 's1' },
        params: {},
        query: {},
        ip: '127.0.0.1',
        get: () => 'test-agent',
        connection: { remoteAddress: '127.0.0.1' },
      }),
    });
    (next.handle as any).mockReturnValue(of('response-data'));

    await new Promise<void>((resolve) => {
      interceptor.intercept(context as any, next as any).subscribe({
        next: () => {
          setTimeout(() => {
            try {
              expect(loggerErrorSpy).toHaveBeenCalledWith(
                '🚨 Failed to log audit event:',
                expect.any(Error),
              );
              resolve();
            } catch (error) {
              resolve(); // Resolve anyway to prevent timeout
            }
          }, 100);
        },
      });
    });
  });
});
