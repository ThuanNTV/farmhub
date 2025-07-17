import { Module } from '@nestjs/common';
import { ReportController } from './controller/report.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ReportService } from './service/report.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
