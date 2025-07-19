import { Module } from '@nestjs/common';
import { StockTransferItemsController } from 'src/modules/stock-transfer-items/controller/stock-transfer-items.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { StockTransferItemsService } from 'src/modules/stock-transfer-items/service/stock-transfer-items.service';

@Module({
  imports: [AuditLogsModule, SecurityModule],
  controllers: [StockTransferItemsController],
  providers: [StockTransferItemsService, TenantDataSourceService],
  exports: [StockTransferItemsService],
})
export class StockTransferItemsModule {}
