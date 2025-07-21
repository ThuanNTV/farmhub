import { Module } from '@nestjs/common';
import { BankController } from './controller/bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { BankService } from './service/bank.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { GlobalDatabaseModule } from 'src/config/db/dbglobal/global-database.module';
import { Bank } from 'src/entities/global/bank.entity';
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
