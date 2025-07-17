import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { StockAdjustmentsController } from './controller/stock-adjustments.controller';
import { StockAdjustmentsService } from 'src/modules/stock-adjustments/service/stock-adjustments.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService],
  exports: [StockAdjustmentsService],
})
export class StockAdjustmentsModule {}
