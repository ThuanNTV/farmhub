import { Module } from '@nestjs/common';
import { BankController } from './controller/bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { Bank } from 'src/entities/global/bank.entity';
import { BankService } from './service/bank.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [
    SecurityModule,
    AuditLogsModule,
    GlobalDatabaseModule,
    TypeOrmModule.forFeature([Bank], 'globalConnection'),
    AuditLogAsyncModule,
  ],
  providers: [BankService],
  controllers: [BankController],
  exports: [BankService],
})
export class BankModule {}
