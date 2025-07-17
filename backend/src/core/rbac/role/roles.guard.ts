import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SafeUser } from 'src/dto/auth/auth.dto';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

interface RequestWithUser extends Request {
  user: SafeUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Superadmin có thể truy cập mọi thứ
    if (user.isSuperadmin) return true;

    return requiredRoles.some((role) => role === (user.role as UserRole));
  }
}
