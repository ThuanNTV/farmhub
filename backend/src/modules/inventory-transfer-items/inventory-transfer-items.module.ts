import { Module } from '@nestjs/common';
import { InventoryTransferItemsController } from 'src/modules/inventory-transfer-items/controller/inventory-transfer-items.controller';
import { InventoryTransferItemsService } from 'src/modules/inventory-transfer-items/service/inventory-transfer-items.service';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [InventoryTransferItemsController],
  providers: [InventoryTransferItemsService, TenantDataSourceService],
  exports: [InventoryTransferItemsService],
})
export class InventoryTransferItemsModule {}
