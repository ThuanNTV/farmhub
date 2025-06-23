// src/global-database/global-database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../../../entities/global/store.entity';
import { User } from 'src/entities/global/user.entity';
import { globalDbConfig } from 'src/config/db/dbglobal/dbConfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...globalDbConfig,
      name: 'globalConnection', // 👈 Tên connection custom
      entities: [Store, User],
    }),
  ],
  exports: [TypeOrmModule],
})
export class GlobalDatabaseModule {}
