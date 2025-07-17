import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { ProductsModule } from '../products/products.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { OrderItemsController } from '../order-items/controller/order-items.controller';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { OrderItemsService } from '../order-items/service';
import { InventoryTransfersService } from '../inventory-transfers/service/inventory-transfers.service';
import { PaymentTransactionService } from '../payments/service';
import { AuditTransactionService } from '../audit-logs/service';
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
