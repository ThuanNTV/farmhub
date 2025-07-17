import { Module } from '@nestjs/common';
import { StockTransferItemsController } from './controller/stock-transfer-items.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { StockTransferItemsService } from './service/stock-transfer-items.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [AuditLogsModule, SecurityModule],
  controllers: [StockTransferItemsController],
  providers: [StockTransferItemsService, TenantDataSourceService],
  exports: [StockTransferItemsService],
})
export class StockTransferItemsModule {}
