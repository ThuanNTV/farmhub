import { Module } from '@nestjs/common';
import { AuditLogsService } from './service/audit-logs.service';
import { AuditLogsController } from './controller/audit-logs.controller';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, SecurityModule, AuditLogAsyncModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
