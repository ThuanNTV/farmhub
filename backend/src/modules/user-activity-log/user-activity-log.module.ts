import { Module } from '@nestjs/common';
import { UserActivityLogController } from 'src/modules/user-activity-log/controller/user-activity-log.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { UserActivityLogService } from 'src/modules/user-activity-log/service/user-activity-log.service';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [UserActivityLogController],
  providers: [UserActivityLogService],
  exports: [UserActivityLogService],
})
export class UserActivityLogModule {}
