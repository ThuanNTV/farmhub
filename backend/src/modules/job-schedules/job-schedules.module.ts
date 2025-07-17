import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { JobSchedulesController } from './controller/job-schedules.controller';
import { JobSchedulesService } from 'src/modules/job-schedules/service/job-schedules.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [JobSchedulesController],
  providers: [JobSchedulesService],
  exports: [JobSchedulesService],
})
export class JobSchedulesModule {}
