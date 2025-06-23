import { Module } from '@nestjs/common';
import { CategorysService } from '../service/categorys.service';
import { CategorysController } from 'src/controller/categorys.controller';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [CategorysController],
  providers: [CategorysService],
})
export class CategorysModule {}
