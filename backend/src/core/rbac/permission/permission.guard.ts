import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SafeUser } from 'src/dto/auth/auth.dto';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

interface RequestWithUser extends Request {
  user: SafeUser;
  params: any;
  body: any;
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'list';
  conditions?: {
    field: string;
    operator: 'eq' | 'ne' | 'in' | 'not_in';
    value: any;
  }[];
}

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    this.logger.debug(`User: ${JSON.stringify(user)}`);
    this.logger.debug(
      `Required Permissions: ${JSON.stringify(requiredPermissions)}`,
    );

    // Superadmin có thể truy cập mọi thứ
    if (user.isSuperadmin === true) return true;

    // Kiểm tra từng permission
    for (const permission of requiredPermissions) {
      if (this.hasPermission(user, permission, request)) {
        return true;
      }
    }

    throw new ForbiddenException('Không có quyền truy cập tài nguyên này');
  }

  private hasPermission(
    user: SafeUser,
    permission: Permission,
    request: RequestWithUser,
  ): boolean {
    // Kiểm tra quyền cơ bản dựa trên role
    if (
      !this.hasRolePermission(user.role, permission.resource, permission.action)
    ) {
      return false;
    }

    // Kiểm tra điều kiện bổ sung
    if (permission.conditions) {
      return this.evaluateConditions(permission.conditions, user, request);
    }

    return true;
  }

  private hasRolePermission(
    role: string,
    resource: string,
    action: string,
  ): boolean {
    const rolePermissions = this.getRolePermissions();
    const userPermissions = rolePermissions[role as UserRole];
    return userPermissions.some(
      (p) =>
        (p.resource === '*' || p.resource === resource) && p.action === action,
    );
  }

  private getRolePermissions(): Record<UserRole, Permission[]> {
    return {
      [UserRole.ADMIN_GLOBAL]: [
        { resource: '*', action: 'create' },
        { resource: '*', action: 'read' },
        { resource: '*', action: 'update' },
        { resource: '*', action: 'delete' },
        { resource: '*', action: 'list' },
      ],
      [UserRole.ADMIN_STORE]: [
        { resource: '*', action: 'create' },
        { resource: '*', action: 'read' },
        { resource: '*', action: 'update' },
        { resource: '*', action: 'delete' },
        { resource: '*', action: 'list' },
      ],
      [UserRole.STORE_MANAGER]: [
        { resource: 'products', action: 'create' },
        { resource: 'products', action: 'read' },
        { resource: 'products', action: 'update' },
        { resource: 'products', action: 'list' },
        { resource: 'orders', action: 'create' },
        { resource: 'orders', action: 'read' },
        { resource: 'orders', action: 'update' },
        { resource: 'orders', action: 'list' },
        { resource: 'customers', action: 'create' },
        { resource: 'customers', action: 'read' },
        { resource: 'customers', action: 'update' },
        { resource: 'customers', action: 'list' },
        { resource: 'categories', action: 'create' },
        { resource: 'categories', action: 'read' },
        { resource: 'categories', action: 'update' },
        { resource: 'categories', action: 'list' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'list' },
        { resource: 'stores', action: 'read' },
        { resource: 'stores', action: 'list' },
      ],
      [UserRole.STORE_STAFF]: [
        { resource: 'products', action: 'read' },
        { resource: 'products', action: 'list' },
        { resource: 'orders', action: 'create' },
        { resource: 'orders', action: 'read' },
        { resource: 'orders', action: 'update' },
        { resource: 'orders', action: 'list' },
        { resource: 'customers', action: 'read' },
        { resource: 'customers', action: 'list' },
        { resource: 'categories', action: 'read' },
        { resource: 'categories', action: 'list' },
      ],
      [UserRole.VIEWER]: [
        { resource: 'products', action: 'read' },
        { resource: 'products', action: 'list' },
        { resource: 'orders', action: 'read' },
        { resource: 'orders', action: 'list' },
        { resource: 'customers', action: 'read' },
        { resource: 'customers', action: 'list' },
        { resource: 'categories', action: 'read' },
        { resource: 'categories', action: 'list' },
      ],
    };
  }

  private evaluateConditions(
    conditions: Array<{ field: string; operator: string; value: unknown }>,
    user: SafeUser,
    request: RequestWithUser,
  ): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, user, request)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(
    condition: { field: string; operator: string; value: unknown },
    user: SafeUser,
    request: RequestWithUser,
  ): boolean {
    const { field, operator, value } = condition;
    let fieldValue: unknown;

    if (typeof field === 'string' && field.startsWith('user.')) {
      fieldValue = this.getNestedValue(
        user as unknown as Record<string, unknown>,
        field.replace('user.', ''),
      );
    } else if (typeof field === 'string' && field.startsWith('params.')) {
      fieldValue = this.getNestedValue(
        (request.params && typeof request.params === 'object'
          ? request.params
          : {}) as Record<string, unknown>,
        field.replace('params.', ''),
      );
    } else if (typeof field === 'string' && field.startsWith('body.')) {
      fieldValue = this.getNestedValue(
        (request.body && typeof request.body === 'object'
          ? request.body
          : {}) as Record<string, unknown>,
        field.replace('body.', ''),
      );
    } else {
      fieldValue = this.getNestedValue(
        user as unknown as Record<string, unknown>,
        field,
      );
    }

    switch (operator) {
      case 'eq':
        return fieldValue === value;
      case 'ne':
        return fieldValue !== value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
}
