import { Module } from '@nestjs/common';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { GlobalDatabaseModule } from 'src/config/global-database.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [GlobalDatabaseModule, StoresModule, UsersModule, ProductsModule],
  controllers: [],
  providers: [TenantDataSourceService],
})
export class AppModule {}
