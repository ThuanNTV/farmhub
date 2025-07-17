import { Module } from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { SecurityModule } from 'src/common/auth/security.module';
import { AuditLogsModule } from 'src/modules/audit-logs/audit-logs.module';
import { CategoriesController } from 'src/modules/categories/controller/categories.controller';
import { CategoriesService } from 'src/modules/categories/service/categories.service';
import { AuditLogAsyncModule } from 'src/common/audit/audit-log-async.module';

@Module({
  imports: [SecurityModule, TenantModule, AuditLogsModule, AuditLogAsyncModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
