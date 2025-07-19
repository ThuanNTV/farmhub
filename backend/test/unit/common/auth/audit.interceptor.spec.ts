import { AuditInterceptor } from '../../../../src/common/auth/audit.interceptor';
import { AuditLogAsyncService } from '../../../../src/common/audit/audit-log-async.service';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditLogAsyncService: jest.Mocked<AuditLogAsyncService>;
  let context: Partial<ExecutionContext>;
  let next: Partial<CallHandler>;

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

  it('cover các hàm private: getAction, getResource, getResourceId, parseError', () => {
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/login')).toBe('login');
    // @ts-ignore
    expect(interceptor['getAction']('POST', '/api/profile')).toBe(
      'profile_update',
    );
    // @ts-ignore
    expect(interceptor['getResource']('/api/products/123')).toBe('products');
    // @ts-ignore
    expect(interceptor['getResourceId']({ id: '1' }, {})).toBe('1');
    // @ts-ignore
    expect(interceptor['getResourceId']({}, { id: '2' })).toBe('2');
    // @ts-ignore
    expect(interceptor['parseError'](new Error('err'))).toBe('err');
    // @ts-ignore
    expect(interceptor['parseError']('str')).toBe('str');
    // @ts-ignore
    expect(interceptor['parseError'](123)).toBe('Unknown error');
  });
});
