import { Module } from '@nestjs/common';
import { OrderItemsController } from 'src/modules/order-items/controller/order-items.controller';
import { OrderItemsService } from 'src/modules/order-items/service/order-items.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, TenantModule, AuditLogAsyncModule],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
