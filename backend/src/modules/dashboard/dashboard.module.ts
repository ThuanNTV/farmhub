import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { DashboardController } from 'src/modules/dashboard/controller/dashboard.controller';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { CustomersModule } from 'src/modules/customers/customers.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { DashboardService } from 'src/modules/dashboard/service/dashboard.service';

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
