import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { UserStoreMappingsService } from 'src/core/user/service/user-store-mappings.service';
import { UserStoreMappingsController } from './controller/user-store-mappings.controller';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    SecurityModule,
    AuditLogsModule,
    GlobalDatabaseModule,
    TypeOrmModule.forFeature(
      [UserStoreMapping, User, Store],
      'globalConnection',
    ),
    AuditLogAsyncModule,
  ],
  providers: [UserStoreMappingsService],
  controllers: [UserStoreMappingsController],
  exports: [UserStoreMappingsService],
})
export class UserStoreMappingsModule {}
