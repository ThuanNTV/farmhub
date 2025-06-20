import { Module } from '@nestjs/common';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { TenantDataSourceService } from 'src/config/tenant-datasource.service';
import { GlobalDatabaseModule } from 'src/config/global-database.module';
import { ProductsModule } from './products/products.module';
import { CategorysModule } from './categorys/categorys.module';

@Module({
  imports: [GlobalDatabaseModule, StoresModule, UsersModule, ProductsModule, CategorysModule],
  controllers: [],
  providers: [TenantDataSourceService],
})
export class AppModule {}
