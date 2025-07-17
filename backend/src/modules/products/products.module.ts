import { Module } from '@nestjs/common';
import { ProductsController } from './controller/products.controller';
import { ProductsService } from './service/products.service';
import { InventoryTransactionService } from './service/inventory/inventory-transaction.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, TenantModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [ProductsController],
  providers: [ProductsService, InventoryTransactionService],
  exports: [ProductsService, InventoryTransactionService],
})
export class ProductsModule {}
