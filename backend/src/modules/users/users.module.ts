import { Module } from '@nestjs/common';
import { UsersController } from 'src/modules/users/controller/users.controller';
import { UserModule } from 'src/core/user/user.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [UserModule, SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [UsersController],
})
export class UsersModule {}
