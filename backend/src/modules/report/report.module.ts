import { Module } from '@nestjs/common';
import { ReportController } from 'src/modules/report/controller/report.controller';
import { ReportService } from 'src/modules/report/service/report.service';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
