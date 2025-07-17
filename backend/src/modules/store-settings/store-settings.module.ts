import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { StoreSettingsController } from './controller/store-settings.controller';
import { StoreSettingsService } from 'src/modules/store-settings/service/store-settings.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  providers: [StoreSettingsService],
  exports: [StoreSettingsService],
})
export class StoreSettingsModule {}
