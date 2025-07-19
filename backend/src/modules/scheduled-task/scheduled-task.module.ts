import { Module } from '@nestjs/common';
import { ScheduledTaskController } from 'src/modules/scheduled-task/controller/scheduled-task.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { ScheduledTaskService } from 'src/modules/scheduled-task/service/scheduled-task.service';
import { SecurityModule } from 'src/common/auth/security.module';

@Module({
  imports: [AuditLogsModule, SecurityModule],
  controllers: [ScheduledTaskController],
  providers: [ScheduledTaskService],
})
export class ScheduledTaskModule {}
