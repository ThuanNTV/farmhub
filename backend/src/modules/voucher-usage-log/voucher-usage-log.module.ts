import { Module } from '@nestjs/common';
import { VoucherUsageLogController } from './controller/voucher-usage-log.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { VoucherUsageLogService } from './service/voucher-usage-log.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [VoucherUsageLogController],
  providers: [VoucherUsageLogService, TenantDataSourceService],
  exports: [VoucherUsageLogService],
})
export class VoucherUsageLogModule {}
