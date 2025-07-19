import { Module } from '@nestjs/common';
import { VoucherUsageLogController } from 'src/modules/voucher-usage-log/controller/voucher-usage-log.controller';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { VoucherUsageLogService } from './service/voucher-usage-log.service';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [VoucherUsageLogController],
  providers: [VoucherUsageLogService, TenantDataSourceService],
  exports: [VoucherUsageLogService],
})
export class VoucherUsageLogModule {}
