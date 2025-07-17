import { Module } from '@nestjs/common';
import { RecreateOrderController } from './controller/recreate-order.controller';
import { RecreateOrderService } from './service/recreate-order.service';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { OrdersModule } from '../orders/orders.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, SecurityModule, OrdersModule, AuditLogAsyncModule],
  controllers: [RecreateOrderController],
  providers: [RecreateOrderService],
  exports: [RecreateOrderService],
})
export class RecreateOrderModule {}
