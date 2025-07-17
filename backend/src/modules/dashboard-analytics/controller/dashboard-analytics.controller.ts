import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DashboardAnalyticsService } from 'src/modules/dashboard-analytics/service/dashboard-analytics.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';

@ApiTags('DashboardAnalytics')
@Controller('tenant/:storeId/dashboard-analytics')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
export class DashboardAnalyticsController {
  constructor(
    private readonly dashboardAnalyticsService: DashboardAnalyticsService,
  ) {}

  @Get('heatmap')
  @ApiOperation({ summary: 'Lấy dữ liệu heatmap' })
  @ApiResponse({ status: 200, description: 'Dữ liệu heatmap' })
  getHeatmap(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.dashboardAnalyticsService.getHeatmap(storeId, from, to);
  }

  @Get('chart')
  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ tổng hợp' })
  @ApiResponse({ status: 200, description: 'Dữ liệu biểu đồ' })
  getChart(
    @Param('storeId') storeId: string,
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.dashboardAnalyticsService.getChart(storeId, type, from, to);
  }

  @Get('industry')
  @ApiOperation({ summary: 'Phân tích theo ngành nghề' })
  @ApiResponse({ status: 200, description: 'Dữ liệu phân tích ngành nghề' })
  getIndustryAnalytics(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.dashboardAnalyticsService.getIndustryAnalytics(
      storeId,
      from,
      to,
    );
  }

  @Get('trend')
  @ApiOperation({ summary: 'Phân tích xu hướng' })
  @ApiResponse({ status: 200, description: 'Dữ liệu phân tích xu hướng' })
  getTrend(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.dashboardAnalyticsService.getTrend(storeId, from, to);
  }
}
