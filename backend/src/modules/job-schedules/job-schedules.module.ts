import { Module } from '@nestjs/common';
import { JobSchedulesController } from 'src/modules/job-schedules/controller/job-schedules.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { JobSchedulesService } from 'src/modules/job-schedules/service/job-schedules.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [JobSchedulesController],
  providers: [JobSchedulesService],
  exports: [JobSchedulesService],
})
export class JobSchedulesModule {}
