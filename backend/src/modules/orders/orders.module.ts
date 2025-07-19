import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/modules/products/products.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { OrderItemsController } from 'src/modules/order-items/controller/order-items.controller';
import { OrdersController } from 'src/modules/orders/controller/orders.controller';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { OrderItemsService } from 'src/modules/order-items/service';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';
import { PaymentTransactionService } from 'src/modules/payments/service';
import { AuditTransactionService } from 'src/modules/audit-logs/service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    SecurityModule,
    TenantModule,
    ProductsModule,
    AuditLogsModule,
    AuditLogAsyncModule,
  ],
  controllers: [OrdersController, OrderItemsController],
  providers: [
    OrdersService,
    OrderItemsService,
    InventoryTransfersService,
    PaymentTransactionService,
    AuditTransactionService,
  ],
  exports: [OrdersService, OrderItemsService],
})
export class OrdersModule {}
