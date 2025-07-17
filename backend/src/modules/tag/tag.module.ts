import { Module } from '@nestjs/common';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TagController } from './controller/tag.controller';
import { TagService } from './service/tag.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [AuditLogsModule, SecurityModule, AuditLogAsyncModule],
  controllers: [TagController],
  providers: [TagService, TenantDataSourceService],
  exports: [TagService],
})
export class TagModule {}
