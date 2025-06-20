import { Module } from '@nestjs/common';
import { CustomersService } from '../service/customers.service';
import { CustomersController } from '../controller/customers.controller';
import { TenantModule } from 'src/config/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
