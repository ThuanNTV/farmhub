import { Module } from '@nestjs/common';
import { LoyaltyPointLogsController } from 'src/modules/loyalty-point-logs/controller/loyalty-point-logs.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { LoyaltyPointLogsService } from './service/loyalty-point-logs.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [LoyaltyPointLogsController],
  providers: [LoyaltyPointLogsService],
  exports: [LoyaltyPointLogsService],
})
export class LoyaltyPointLogsModule {}
