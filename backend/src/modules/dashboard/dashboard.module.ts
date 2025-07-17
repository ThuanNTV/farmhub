import { Module } from '@nestjs/common';
import { DashboardController } from './controller/dashboard.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { DashboardService } from './service/dashboard.service';

@Module({
  imports: [
    SecurityModule,
    OrdersModule,
    CustomersModule,
    ProductsModule,
    AuditLogsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
