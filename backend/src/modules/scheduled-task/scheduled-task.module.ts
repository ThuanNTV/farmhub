import { Module } from '@nestjs/common';
import { ScheduledTaskController } from './controller/scheduled-task.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { ScheduledTaskService } from './service/scheduled-task.service';

@Module({
  imports: [AuditLogsModule, SecurityModule],
  controllers: [ScheduledTaskController],
  providers: [ScheduledTaskService],
})
export class ScheduledTaskModule {}
