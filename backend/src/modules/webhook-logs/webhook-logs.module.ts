import { Module } from '@nestjs/common';
import { WebhookLogsController } from 'src/modules/webhook-logs/controller/webhook-logs.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { WebhookLogsService } from 'src/modules/webhook-logs/service/webhook-logs.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [WebhookLogsController],
  providers: [WebhookLogsService],
  exports: [WebhookLogsService],
})
export class WebhookLogsModule {}
