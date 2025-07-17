import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { LoyaltyPointLogsController } from './controller/loyalty-point-logs.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { LoyaltyPointLogsService } from 'src/modules/loyalty-point-logs/service/loyalty-point-logs.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [LoyaltyPointLogsController],
  providers: [LoyaltyPointLogsService],
  exports: [LoyaltyPointLogsService],
})
export class LoyaltyPointLogsModule {}
