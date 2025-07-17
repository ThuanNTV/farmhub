import { JwtService } from '@nestjs/jwt';
import { SafeUser } from '../../src/modules/auth/dto/auth.dto';
import { UserRole } from '../../src/modules/users/dto/create-user.dto';

export class TestAuth {
  static generateTestUser(overrides: Partial<SafeUser> = {}): SafeUser {
    return {
      userId: '1',
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      role: UserRole.STORE_MANAGER,
      associatedStoreIds: ['1'],
      isSuperadmin: false,
      ...overrides,
    };
  }

  static generateTestToken(user: SafeUser, jwtService: JwtService): string {
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
      email: user.email,
      sessionId: `test-session-${Date.now()}`,
    };

    return jwtService.sign(payload, { expiresIn: '1h' });
  }

  static generateAdminUser(): SafeUser {
    return this.generateTestUser({
      userId: '2',
      username: 'admin',
      fullName: 'Admin User',
      email: 'admin@example.com',
      role: UserRole.ADMIN_GLOBAL,
      isSuperadmin: true,
    });
  }

  static generateStaffUser(): SafeUser {
    return this.generateTestUser({
      userId: '3',
      username: 'staff',
      fullName: 'Staff User',
      email: 'staff@example.com',
      role: UserRole.STORE_STAFF,
      isSuperadmin: false,
    });
  }

  static generateViewerUser(): SafeUser {
    return this.generateTestUser({
      userId: '4',
      username: 'viewer',
      fullName: 'Viewer User',
      email: 'viewer@example.com',
      role: UserRole.VIEWER,
      isSuperadmin: false,
    });
  }
}
