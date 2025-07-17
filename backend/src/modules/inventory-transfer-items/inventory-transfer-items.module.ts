import { Module } from '@nestjs/common';
import { InventoryTransferItemsController } from './controller/inventory-transfer-items.controller';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { InventoryTransferItemsService } from './service/inventory-transfer-items.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [InventoryTransferItemsController],
  providers: [InventoryTransferItemsService, TenantDataSourceService],
  exports: [InventoryTransferItemsService],
})
export class InventoryTransferItemsModule {}
