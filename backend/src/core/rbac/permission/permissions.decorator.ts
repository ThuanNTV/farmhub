import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/core/rbac/permission/permission.guard';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Decorator helpers cho các permission phổ biến
export const RequireProductPermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'products', action });

export const RequireOrderPermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'orders', action });

export const RequireCustomerPermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'customers', action });

export const RequireCategoryPermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'categories', action });

export const RequireUserPermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'users', action });

export const RequireStorePermission = (
  action: 'create' | 'read' | 'update' | 'delete' | 'list',
) => RequirePermissions({ resource: 'stores', action });

// Decorator với điều kiện bổ sung
export const RequireOwnResource = (
  resource: string,
  action: 'read' | 'update' | 'delete',
) =>
  RequirePermissions({
    resource,
    action,
    conditions: [
      {
        field: 'params.userId',
        operator: 'eq',
        value: 'user.userId',
      },
    ],
  });
