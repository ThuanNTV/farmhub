import { Module } from '@nestjs/common';
import { StockTransferController } from 'src/modules/stock-transfer/controller/stock-transfer.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { StockTransferService } from 'src/modules/stock-transfer/service/stock-transfer.service';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [StockTransferController],
  providers: [StockTransferService, TenantDataSourceService],
  exports: [StockTransferService],
})
export class StockTransferModule {}
