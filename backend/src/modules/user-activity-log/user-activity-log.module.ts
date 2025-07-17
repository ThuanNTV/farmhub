import { Module } from '@nestjs/common';
import { UserActivityLogController } from './controller/user-activity-log.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { UserActivityLogService } from './service/user-activity-log.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [UserActivityLogController],
  providers: [UserActivityLogService],
  exports: [UserActivityLogService],
})
export class UserActivityLogModule {}
