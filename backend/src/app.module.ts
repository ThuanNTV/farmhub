import { Module } from '@nestjs/common';
import { StoresModule } from './module/stores.module';
import { UsersModule } from './module/users.module';
import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { GlobalDatabaseModule } from 'src/config/global-database.module';
import { CategorysModule } from './module/categorys.module';
import { ProductsModule } from 'src/module/products.module';
import { CustomersModule } from './module/customers.module';
import { OrdersModule } from './module/orders.module';

@Module({
  imports: [
    GlobalDatabaseModule,
    StoresModule,
    UsersModule,
    ProductsModule,
    CategorysModule,
    CustomersModule,
    OrdersModule,
  ],
  providers: [TenantDataSourceService],
})
export class AppModule {}
