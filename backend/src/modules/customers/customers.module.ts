import { Module } from '@nestjs/common';
import { CustomersController } from 'src/modules/customers/controller/customers.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, TenantModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
