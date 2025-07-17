import { Module } from '@nestjs/common';
import { StockTransferController } from './controller/stock-transfer.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { StockTransferService } from './service/stock-transfer.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [StockTransferController],
  providers: [StockTransferService, TenantDataSourceService],
  exports: [StockTransferService],
})
export class StockTransferModule {}
