import { Module } from '@nestjs/common';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { StoreSettingsService } from 'src/modules/store-settings/service/store-settings.service';

@Module({
  imports: [TenantModule, SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  providers: [StoreSettingsService],
  exports: [StoreSettingsService],
})
export class StoreSettingsModule {}
