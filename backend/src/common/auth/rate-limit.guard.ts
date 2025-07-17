import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitConfig {
  windowMs: number; // Thời gian cửa sổ (ms)
  maxRequests: number; // Số request tối đa trong cửa sổ
  skipSuccessfulRequests?: boolean; // Bỏ qua request thành công
  skipFailedRequests?: boolean; // Bỏ qua request thất bại
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestRecords = new Map<string, RequestRecord>();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<RateLimitConfig>(
      'rateLimit',
      [context.getHandler(), context.getClass()],
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      connection?: { remoteAddress?: string };
      user?: { userId?: string };
      route?: { path?: string };
      url?: string;
    }>();
    const key = this.generateKey(request, config);

    return this.checkRateLimit(key, config);
  }

  private generateKey(
    request: {
      ip?: string;
      connection?: { remoteAddress?: string };
      user?: { userId?: string };
      route?: { path?: string };
      url?: string;
    },
    _config: RateLimitConfig,
  ): string {
    const ip =
      typeof request.ip === 'string'
        ? request.ip
        : request.connection &&
            typeof request.connection.remoteAddress === 'string'
          ? request.connection.remoteAddress
          : 'unknown';
    const userId =
      request.user && typeof request.user.userId === 'string'
        ? request.user.userId
        : 'anonymous';
    const endpoint =
      request.route && typeof request.route.path === 'string'
        ? request.route.path
        : typeof request.url === 'string'
          ? request.url
          : 'unknown';

    return `${ip}:${userId}:${endpoint}`;
  }

  private checkRateLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.requestRecords.get(key);

    if (!record || now > record.resetTime) {
      // Tạo record mới hoặc reset record cũ
      this.requestRecords.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (record.count >= config.maxRequests) {
      throw new HttpException(
        {
          message: 'Quá nhiều request. Vui lòng thử lại sau.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  // Cleanup old records định kỳ
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requestRecords.entries()) {
      if (now > record.resetTime) {
        this.requestRecords.delete(key);
      }
    }
  }
}
