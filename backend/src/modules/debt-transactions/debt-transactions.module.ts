import { Module } from '@nestjs/common';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { DebtTransactionsController } from 'src/modules/debt-transactions/controller/debt-transactions.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { DebtTransactionsService } from 'src/modules/debt-transactions/service/debt-transactions.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule], // Import the TenantDataSourceService to manage tenant-specific data sources
  controllers: [DebtTransactionsController],
  providers: [DebtTransactionsService],
  exports: [DebtTransactionsService],
})
export class DebtTransactionsModule {}
