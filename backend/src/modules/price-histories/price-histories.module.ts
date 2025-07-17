import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { PriceHistoriesController } from './controller/price-histories.controller';
import { PriceHistoriesService } from 'src/modules/price-histories/service/price-histories.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [PriceHistoriesController],
  providers: [PriceHistoriesService],
  exports: [PriceHistoriesService],
})
export class PriceHistoriesModule {}
