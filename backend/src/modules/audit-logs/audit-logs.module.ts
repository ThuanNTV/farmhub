import { Module } from '@nestjs/common';
import { AuditLogsService } from './service/audit-logs.service';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
