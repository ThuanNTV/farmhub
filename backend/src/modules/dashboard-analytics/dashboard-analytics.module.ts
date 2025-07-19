import { Module } from '@nestjs/common';
import { DashboardAnalyticsController } from 'src/modules/dashboard-analytics/controller/dashboard-analytics.controller';
import { DashboardAnalyticsService } from 'src/modules/dashboard-analytics/service/dashboard-analytics.service';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';

@Module({
  imports: [SecurityModule, TenantModule],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
