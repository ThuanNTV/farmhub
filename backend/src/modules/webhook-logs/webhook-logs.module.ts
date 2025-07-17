import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { WebhookLogsController } from './controller/webhook-logs.controller';
import { WebhookLogsService } from 'src/modules/webhook-logs/service/webhook-logs.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [WebhookLogsController],
  providers: [WebhookLogsService],
  exports: [WebhookLogsService],
})
export class WebhookLogsModule {}
