// src/global-database/global-database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from 'src/entities/global/store.entity';
import { User } from 'src/entities/global/user.entity';
import { Bank } from 'src/entities/global/bank.entity';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { Unit } from 'src/entities/global/unit.entity';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { dbConfig } from 'src/config/db/dbglobal/dbConfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      name: 'globalConnection',
      entities: [Store, User, Bank, UserStoreMapping, Unit, PaymentMethod],
      extra: {
        max: 20,
        min: 5,
        acquireTimeoutMillis: 2000,
        idleTimeoutMillis: 10000,
        reapIntervalMillis: 3000,
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class GlobalDatabaseModule {}
