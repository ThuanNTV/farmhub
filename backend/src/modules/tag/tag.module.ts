import { Module } from '@nestjs/common';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { TagController } from 'src/modules/tag/controller/tag.controller';
import { TagService } from 'src/modules/tag/service/tag.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [TagController],
  providers: [TagService, TenantDataSourceService],
  exports: [TagService],
})
export class TagModule {}
