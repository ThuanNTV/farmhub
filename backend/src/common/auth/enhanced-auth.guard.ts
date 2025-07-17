import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { SecurityService } from 'src/service/global/security.service';

@Injectable()
export class EnhancedAuthGuard extends AuthGuard('enhanced-jwt') {
  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = super.canActivate(context);
    if (typeof result === 'boolean' || result instanceof Promise) {
      return await result;
    }
    if (typeof (result as { toPromise?: unknown }).toPromise === 'function') {
      return await (
        result as { toPromise: () => Promise<boolean> }
      ).toPromise();
    }
    // If result is Observable, convert to Promise
    if (typeof result.subscribe === 'function') {
      return await firstValueFrom(result);
    }
    throw new Error('Unexpected return type from AuthGuard canActivate');
  }

  handleRequest<TUser = any>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      const request = context
        .switchToHttp()
        .getRequest<{ ip?: string; connection?: { remoteAddress?: string } }>();
      const clientIP: string =
        typeof request.ip === 'string'
          ? request.ip
          : request.connection &&
              typeof request.connection.remoteAddress === 'string'
            ? request.connection.remoteAddress
            : 'unknown';
      this.securityService.recordFailedLoginAttempt(clientIP);
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    const request = context
      .switchToHttp()
      .getRequest<{ ip?: string; connection?: { remoteAddress?: string } }>();
    const clientIP: string =
      typeof request.ip === 'string'
        ? request.ip
        : request.connection &&
            typeof request.connection.remoteAddress === 'string'
          ? request.connection.remoteAddress
          : 'unknown';
    this.securityService.recordSuccessfulLogin(clientIP);

    return user as TUser;
  }
}
