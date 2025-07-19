import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/core/auth/controller/auth.controller';
import { SecurityService } from 'src/service/global/security.service';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { RateLimitGuard } from 'src/common/auth/rate-limit.guard';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UsersModule } from 'src/modules/users/users.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { UserModule } from 'src/core/user/user.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuthService } from 'src/core/auth/service/auth.service';
import { LocalStrategy } from 'src/common/auth/local.strategy';
import { JwtStrategy } from 'src/common/auth/jwt.strategy';
import { EnhancedJwtStrategy } from 'src/common/auth/enhanced-jwt.strategy';

@Module({
  imports: [
    UsersModule,
    AuditLogsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    AuditLogAsyncModule,
  ],
  providers: [
    AuthService,
    SecurityService,
    LocalStrategy,
    JwtStrategy,
    EnhancedJwtStrategy,
    PermissionGuard,
    RateLimitGuard,
    EnhancedAuthGuard,
    AuditInterceptor,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    SecurityService,
    PermissionGuard,
    RateLimitGuard,
    EnhancedAuthGuard,
    AuditInterceptor,
  ],
})
export class AuthModule {}
