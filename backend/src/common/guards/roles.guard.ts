import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/dto/dtoUsers/create-user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: { isSuperadmin?: boolean; role?: UserRole } = request.user;

    // Superadmin có thể truy cập mọi thứ
    if (user.isSuperadmin) {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
