import { Module } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { OrdersController } from 'src/controller/orders.controller';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
