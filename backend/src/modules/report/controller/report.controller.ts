import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportService } from 'src/modules/report/service/report.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';

@ApiTags('Reports')
@Controller('tenant/:storeId/reports')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@ApiBearerAuth('access-token')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('export')
  @ApiOperation({ summary: 'Xuất báo cáo tổng hợp (Excel/PDF)' })
  @ApiResponse({
    status: 200,
    description: 'File báo cáo hoặc dữ liệu báo cáo',
  })
  exportReport(
    @Param('storeId') storeId: string,
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.exportReport(storeId, type, from, to);
  }

  @Get('types')
  @ApiOperation({ summary: 'Lấy danh sách loại báo cáo hỗ trợ' })
  @ApiResponse({ status: 200, description: 'Danh sách loại báo cáo' })
  getReportTypes() {
    return this.reportService.getReportTypes();
  }

  @Get('preview')
  @ApiOperation({ summary: 'Xem trước dữ liệu báo cáo' })
  @ApiResponse({ status: 200, description: 'Dữ liệu báo cáo (preview)' })
  previewReport(
    @Param('storeId') storeId: string,
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, type, from, to);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Báo cáo doanh thu chi tiết' })
  @ApiResponse({ status: 200, description: 'Báo cáo doanh thu' })
  revenueReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, 'revenue', from, to);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Báo cáo đơn hàng chi tiết' })
  @ApiResponse({ status: 200, description: 'Báo cáo đơn hàng' })
  ordersReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, 'orders', from, to);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Báo cáo khách hàng' })
  @ApiResponse({ status: 200, description: 'Báo cáo khách hàng' })
  customersReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, 'customers', from, to);
  }

  @Get('products')
  @ApiOperation({ summary: 'Báo cáo sản phẩm' })
  @ApiResponse({ status: 200, description: 'Báo cáo sản phẩm' })
  productsReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, 'products', from, to);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Báo cáo tồn kho' })
  @ApiResponse({ status: 200, description: 'Báo cáo tồn kho' })
  inventoryReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.previewReport(storeId, 'inventory', from, to);
  }
}
