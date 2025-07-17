import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ExternalSystemLogsController } from './controller/external-system-logs.controller';
import { ExternalSystemLogsService } from 'src/modules/external-system-logs/service/external-system-logs.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [ExternalSystemLogsController],
  providers: [ExternalSystemLogsService],
  exports: [ExternalSystemLogsService],
})
export class ExternalSystemLogsModule {}
