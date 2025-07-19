import { Module } from '@nestjs/common';
import { RecreateOrderController } from 'src/modules/recreate-order/controller/recreate-order.controller';
import { RecreateOrderService } from 'src/modules/recreate-order/service/recreate-order.service';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule, SecurityModule, OrdersModule, AuditLogAsyncModule],
  controllers: [RecreateOrderController],
  providers: [RecreateOrderService],
  exports: [RecreateOrderService],
})
export class RecreateOrderModule {}
