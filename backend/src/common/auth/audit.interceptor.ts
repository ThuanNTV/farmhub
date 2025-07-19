import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { SafeUser } from 'src/dto/auth/auth.dto';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { throwError } from 'rxjs';

interface RequestWithUser extends Request {
  user?: SafeUser;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogAsyncService: AuditLogAsyncService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, user } = request;

    const body = this.safeObject(request.body);
    const params = this.safeObject(request.params);
    const query = this.safeObject(request.query);
    const ip = this.getRequestIp(request);
    const userAgent = this.getUserAgent(request);
    const startTime = Date.now();

    const shouldAudit =
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !!user;

    if (!shouldAudit) return next.handle();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.logAuditEvent({
            user,
            method,
            url,
            body,
            params,
            query,
            status: 'success',
            duration: Date.now() - startTime,
            timestamp: new Date(),
            ip,
            userAgent,
            responseData: data,
          }).catch((err) => {
            Logger.error('🚨 Failed to log audit event:', err);
          });
        },
        error: (error) => {
          this.logAuditEvent({
            user,
            method,
            url,
            body,
            params,
            query,
            status: 'error',
            duration: Date.now() - startTime,
            timestamp: new Date(),
            ip,
            userAgent,
            error,
          }).catch((err) => {
            Logger.error('🚨 Failed to log audit event:', err);
          });
        },
      }),
    );
  }

  // --- Internal utilities ---

  private safeObject(input: any): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return typeof input === 'object' && input !== null ? input : {};
  }

  private getRequestIp(request: Request): string {
    return (
      (typeof request.ip === 'string' && request.ip) ||
      (typeof request.connection.remoteAddress === 'string'
        ? request.connection.remoteAddress
        : 'unknown')
    );
  }

  private getUserAgent(request: Request): string {
    return typeof request.get === 'function'
      ? (request.get('User-Agent') ?? 'unknown')
      : 'unknown';
  }

  private getAction(method: string, url: string): string {
    const path = url.toLowerCase();
    if (path.includes('login')) return 'login';
    if (path.includes('logout')) return 'logout';
    if (path.includes('password')) return 'password_change';
    if (path.includes('profile')) return 'profile_update';
    return method.toLowerCase();
  }

  private getResource(url: string): string {
    const pathParts = url.split('/').filter(Boolean);
    return pathParts.length > 1 ? pathParts[1] : 'unknown';
  }

  private getResourceId(
    params: Record<string, unknown>,
    body: Record<string, unknown>,
  ): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return ((params.id ?? body.id) as string) ?? null;
  }

  private async logAuditEvent(data: {
    user?: SafeUser;
    method: string;
    url: string;
    body: Record<string, unknown>;
    params: Record<string, unknown>;
    query: Record<string, unknown>;
    status: 'success' | 'error';
    timestamp: Date;
    duration: number;
    ip: string;
    userAgent: string;
    responseData?: unknown;
    error?: unknown;
  }): Promise<void> {
    const {
      user,
      method,
      url,
      body,
      params,
      query,
      status,
      duration,
      ip,
      userAgent,
      responseData,
      error,
    } = data;

    const storeId =
      typeof body.storeId === 'string'
        ? body.storeId
        : typeof params.storeId === 'string'
          ? params.storeId
          : undefined;
    if (!user?.userId || !storeId) return;

    // Xác định action
    const action = this.getAction(method, url).toUpperCase();
    const resource = this.getResource(url);
    const resourceId = this.getResourceId(params, body) ?? undefined;
    const details = {
      method,
      url,
      requestData: { body, params, query },
      ...(status === 'success'
        ? { responseData }
        : { error: this.parseError(error) }),
      duration,
      ipAddress: ip,
      userAgent,
    };

    try {
      if (action === 'CREATE') {
        await this.auditLogAsyncService.logCreate(
          user.userId,
          user.username || '',
          resource,
          resourceId ?? '',
          body,
          storeId,
          { details },
        );
      } else if (action === 'UPDATE') {
        await this.auditLogAsyncService.logUpdate(
          user.userId,
          user.username || '',
          resource,
          resourceId ?? '',
          params.oldData || {},
          body,
          storeId,
          { details },
        );
      } else if (action === 'DELETE') {
        await this.auditLogAsyncService.logDelete(
          user.userId,
          user.username || '',
          resource,
          resourceId ?? '',
          body,
          storeId,
          { details },
        );
      } else {
        await this.auditLogAsyncService.logCriticalAction(
          user.userId,
          user.username || '',
          action,
          resource,
          resourceId ?? '',
          details,
          storeId,
        );
      }
    } catch (err) {
      this.logger.error('Persist audit log failed', err);
    }
  }

  private parseError(error: unknown): string {
    if (typeof error === 'object' && error && 'message' in error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return (error as any).message ?? 'Unknown error';
    }
    if (typeof error === 'string') return error;
    return 'Unknown error';
  }
}
