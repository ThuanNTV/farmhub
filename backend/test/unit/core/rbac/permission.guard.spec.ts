import { PermissionGuard, Permission } from 'src/core/rbac/permission/permission.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let context: Partial<ExecutionContext>;

  const mockUser = (props: any = {}) => ({
    id: 1,
    role: UserRole.ADMIN_STORE,
    isSuperadmin: false,
    ...props,
  });

  const mockRequest = (user: any, params: any = {}, body: any = {}) => ({
    user,
    params,
    body,
  });

  const mockContext = (user: any, permissions: Permission[] = []) => {
    const req = mockRequest(user);
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new PermissionGuard(reflector);
  });

  it('trả về true nếu không có permission yêu cầu', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    const ctx = mockContext(mockUser());
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('superadmin luôn trả về true', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      { resource: 'products', action: 'read' },
    ]);
    const ctx = mockContext(mockUser({ isSuperadmin: true }));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('user có quyền phù hợp sẽ trả về true', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      { resource: 'products', action: 'read' },
    ]);
    const ctx = mockContext(mockUser({ role: UserRole.ADMIN_STORE }));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('user không có quyền sẽ throw ForbiddenException', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      { resource: 'products', action: 'delete' },
    ]);
    const ctx = mockContext(mockUser({ role: UserRole.VIEWER }));
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('user có quyền với điều kiện đúng', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      {
        resource: 'products',
        action: 'read',
        conditions: [
          { field: 'user.id', operator: 'eq', value: 1 },
        ],
      },
    ]);
    const ctx = mockContext(mockUser({ id: 1 }));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('user có quyền nhưng điều kiện sai sẽ throw', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      {
        resource: 'products',
        action: 'read',
        conditions: [
          { field: 'user.id', operator: 'eq', value: 2 },
        ],
      },
    ]);
    const ctx = mockContext(mockUser({ id: 1 }));
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('test các nhánh evaluateCondition: ne, in, not_in', () => {
    const permission: Permission = {
      resource: 'products',
      action: 'read',
      conditions: [
        { field: 'user.id', operator: 'ne', value: 2 },
        { field: 'user.role', operator: 'in', value: [UserRole.ADMIN_STORE, UserRole.VIEWER] },
        { field: 'user.role', operator: 'not_in', value: [UserRole.STORE_MANAGER] },
      ],
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([permission]);
    const ctx = mockContext(mockUser({ id: 1, role: UserRole.ADMIN_STORE }));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('test getNestedValue trả về undefined nếu path sai', () => {
    const obj = { a: { b: 1 } };
    // @ts-ignore
    expect(guard['getNestedValue'](obj, 'a.b.c')).toBeUndefined();
  });
});
