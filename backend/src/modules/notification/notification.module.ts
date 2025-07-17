import { Module } from '@nestjs/common';
import { NotificationController } from './controller/notification.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { NotificationService } from 'src/service/global/notification.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [NotificationController],
  providers: [NotificationService, TenantDataSourceService],
  exports: [NotificationService],
})
export class NotificationModule {}
