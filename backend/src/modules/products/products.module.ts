import { Module } from '@nestjs/common';
import { ProductsController } from 'src/modules/products/controller/products.controller';
import { ProductsService } from 'src/modules/products/service/products.service';
import { InventoryTransactionService } from 'src/modules/products/service/inventory/inventory-transaction.service';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [SecurityModule, TenantModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [ProductsController],
  providers: [ProductsService, InventoryTransactionService],
  exports: [ProductsService, InventoryTransactionService],
})
export class ProductsModule {}
