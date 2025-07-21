import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { GlobalDatabaseModule } from 'src/config/db/dbglobal/global-database.module';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { UserStoreMappingsService } from 'src/modules/user-store-mappings/service/user-store-mappings.service';
import { UserStoreMappingsAdvancedService } from 'src/modules/user-store-mappings/service/user-store-mappings-advanced.service';
import { UserStoreMappingsController } from 'src/modules/user-store-mappings/controller/user-store-mappings.controller';
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
  providers: [UserStoreMappingsService, UserStoreMappingsAdvancedService],
  controllers: [UserStoreMappingsController],
  exports: [UserStoreMappingsService, UserStoreMappingsAdvancedService],
})
export class UserStoreMappingsModule {}
