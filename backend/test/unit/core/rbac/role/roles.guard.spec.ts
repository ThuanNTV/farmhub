import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: jest.Mocked<ExecutionContext>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
    context = {
      switchToHttp: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  it('trả về true nếu không có roles yêu cầu', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('trả về true nếu user là superadmin', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN_GLOBAL]);
    const user = { isSuperadmin: true, role: UserRole.STORE_STAFF };
    context.switchToHttp.mockReturnValue({
      getRequest: () => ({ user }),
    } as any);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('trả về true nếu user có role phù hợp', () => {
    reflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN_GLOBAL,
      UserRole.STORE_STAFF,
    ]);
    const user = { isSuperadmin: false, role: UserRole.STORE_STAFF };
    context.switchToHttp.mockReturnValue({
      getRequest: () => ({ user }),
    } as any);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('trả về false nếu user không có role phù hợp', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN_GLOBAL]);
    const user = { isSuperadmin: false, role: UserRole.STORE_STAFF };
    context.switchToHttp.mockReturnValue({
      getRequest: () => ({ user }),
    } as any);
    expect(guard.canActivate(context)).toBe(false);
  });
});
