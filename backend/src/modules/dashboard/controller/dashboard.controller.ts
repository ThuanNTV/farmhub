import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DashboardService } from 'src/modules/dashboard/service/dashboard.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';

@ApiTags('Dashboard')
@Controller('tenant/:storeId/dashboard')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Thống kê tổng quan hệ thống' })
  @ApiResponse({ status: 200, description: 'Dữ liệu tổng quan' })
  async getOverview(@Param('storeId') storeId: string) {
    return this.dashboardService.getOverview(storeId);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Thống kê doanh thu theo thời gian' })
  @ApiResponse({ status: 200, description: 'Dữ liệu doanh thu' })
  async getRevenue(@Param('storeId') storeId: string) {
    return this.dashboardService.getRevenue(storeId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Thống kê đơn hàng theo trạng thái/thời gian' })
  @ApiResponse({ status: 200, description: 'Dữ liệu đơn hàng' })
  async getOrders(@Param('storeId') storeId: string) {
    return this.dashboardService.getOrders(storeId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Thống kê khách hàng' })
  @ApiResponse({ status: 200, description: 'Dữ liệu khách hàng' })
  async getCustomers(@Param('storeId') storeId: string) {
    return this.dashboardService.getCustomers(storeId);
  }

  @Get('best-selling-products')
  @ApiOperation({ summary: 'Top sản phẩm bán chạy' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm bán chạy' })
  async getBestSellingProducts(@Param('storeId') storeId: string) {
    return this.dashboardService.getBestSellingProducts(storeId);
  }
}
