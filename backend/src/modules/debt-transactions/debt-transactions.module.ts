import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { DebtTransactionsController } from './controller/debt-transactions.controller';
import { DebtTransactionsService } from 'src/modules/debt-transactions/service/debt-transactions.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [DebtTransactionsController],
  providers: [DebtTransactionsService],
  exports: [DebtTransactionsService],
})
export class DebtTransactionsModule {}
