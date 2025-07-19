import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { ExternalSystemLogsController } from 'src/modules/external-system-logs/controller/external-system-logs.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ExternalSystemLogsService } from 'src/modules/external-system-logs/service/external-system-logs.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ExternalSystemLogsController],
  providers: [ExternalSystemLogsService],
  exports: [ExternalSystemLogsService],
})
export class ExternalSystemLogsModule {}
