import { Module } from '@nestjs/common';
import { VouchersController } from 'src/modules/vouchers/controller/vouchers.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { VouchersService } from 'src/modules/vouchers/service/vouchers.service';

@Module({
  imports: [TenantModule, AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
