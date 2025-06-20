import { Module } from '@nestjs/common';
import { StoresService } from '../service/stores.service';
import { GlobalDatabaseModule } from 'src/config/global-database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/entities/global/store.entity';
import { TenantModule } from 'src/config/tenant.module';
import { StoresController } from 'src/controller/stores.controller';

@Module({
  imports: [
    GlobalDatabaseModule, // 👈 Import cái này để lấy được Repository của 'globalConnection'
    TypeOrmModule.forFeature([Store], 'globalConnection'),
    TenantModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
