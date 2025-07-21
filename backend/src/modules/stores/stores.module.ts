import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from 'src/modules/stores/controller/stores.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { StoresService } from 'src/modules/stores/service/stores.service';
import { GlobalEntityService } from 'src/service/global-entity.service';
import { Store } from 'src/entities/global/store.entity';
import { User } from 'src/entities/global/user.entity';
import { Bank } from 'src/entities/global/bank.entity';
import { Unit } from 'src/entities/global/unit.entity';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { GlobalDatabaseModule } from 'src/config/db/dbglobal/global-database.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    GlobalDatabaseModule,
    TypeOrmModule.forFeature(
      [Store, User, Bank, Unit, PaymentMethod],
      'globalConnection',
    ),
    TenantModule,
    SecurityModule,
    AuditLogsModule,
    AuditLogAsyncModule,
  ],
  controllers: [StoresController],
  providers: [StoresService, GlobalEntityService],
})
export class StoresModule {}
