import { Module } from '@nestjs/common';
import { DashboardAnalyticsController } from './controller/dashboard-analytics.controller';
import { SecurityModule } from 'src/common/auth/security.module';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { DashboardAnalyticsService } from './service/dashboard-analytics.service';

@Module({
  imports: [SecurityModule, TenantModule],
  controllers: [DashboardAnalyticsController],
  providers: [DashboardAnalyticsService],
})
export class DashboardAnalyticsModule {}
