import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from 'src/modules/products/service/products.service';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';
import { ProductResponseDto } from 'src/modules/products/dto/product-response.dto';
import { ProductSearchDto } from 'src/modules/products/dto/product-search.dto';
import { ProductFilterDto } from 'src/modules/products/dto/product-filter.dto';
import {
  ProductPaginationDto,
  ProductStatsDto,
} from 'src/modules/products/dto/product-pagination.dto';
import {
  BulkUpdateRequestDto,
  BulkDeleteRequestDto,
  BulkOperationResultDto,
  BulkStockAdjustmentDto,
} from 'src/modules/products/dto/bulk-operations.dto';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequireProductPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RequirePermissions } from 'src/core/rbac/permission/permissions.decorator';
import { Query } from '@nestjs/common';
import { PriceHistoriesService } from 'src/modules/price-histories/service/price-histories.service';
import { PriceHistoryResponseDto } from 'src/modules/price-histories/dto/priceHistory-response.dto';
import { ReportService } from 'src/modules/report/service/report.service';
import { ProductReportFilterDto } from '../dto/product-reports.dto';
import { InventoryAnalyticsService } from '../service/inventory-analytics.service';
import {
  InventoryAnalyticsFilterDto,
  InventoryAnalyticsReportDto,
  InventoryKPIDto,
} from '../dto/inventory-analytics.dto';
import { SupplierIntegrationService } from '../service/supplier-integration.service';
import { SupplierIntegrationExtendedService } from '../service/supplier-integration-extended.service';
import {
  SupplierProductFilterDto,
  SupplierProductsResponseDto,
  SupplierPerformanceDto,
  SupplierAnalyticsDto,
  AssignSupplierDto,
  UnassignSupplierDto,
  SupplierOperationResultDto,
} from '../dto/supplier-integration.dto';
import { ProductRecommendationsService } from '../service/product-recommendations.service';
import {
  ProductRecommendationFilterDto,
  ProductRecommendationsResponseDto,
  BulkRecommendationRequestDto,
  BulkRecommendationResponseDto,
} from '../dto/product-recommendations.dto';
import { AdvancedSearchService } from '../service/advanced-search.service';
import {
  AdvancedSearchDto,
  AdvancedSearchResponseDto,
  SearchSuggestionsResponseDto,
} from '../dto/advanced-search.dto';

@ApiTags('Products')
@Controller('tenant/:storeId/products')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly priceHistoriesService: PriceHistoriesService,
    private readonly reportService: ReportService,
    private readonly inventoryAnalyticsService: InventoryAnalyticsService,
    private readonly supplierIntegrationService: SupplierIntegrationService,
    private readonly supplierIntegrationExtendedService: SupplierIntegrationExtendedService,
    private readonly productRecommendationsService: ProductRecommendationsService,
    private readonly advancedSearchService: AdvancedSearchService,
  ) {}

  @Post()
  @RequireProductPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo sản phẩm' })
  create(
    @Param('storeId') storeId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(storeId, createProductDto);
  }

  @Get()
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm',
    type: [ProductResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  findAll(@Param('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }

  @Get(':id')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin sản phẩm',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem sản phẩm' })
  findOne(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.findOne(storeId, id);
  }

  @Patch(':id')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(storeId, id, updateProductDto);
  }

  @Delete(':id')
  @RequireProductPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.remove(storeId, id);
  }

  @Patch(':id/restore')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục sản phẩm đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  restore(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.restore(storeId, id);
  }

  // Search endpoints
  @Get('search')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả tìm kiếm sản phẩm',
    type: ProductPaginationDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền tìm kiếm' })
  searchProducts(
    @Param('storeId') storeId: string,
    @Query() searchDto: ProductSearchDto,
  ) {
    return this.productsService.searchProducts(storeId, searchDto);
  }

  @Post('filter')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lọc sản phẩm nâng cao' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả lọc sản phẩm',
    type: ProductPaginationDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền lọc' })
  filterProducts(
    @Param('storeId') storeId: string,
    @Body() filterDto: ProductFilterDto,
  ) {
    return this.productsService.filterProducts(storeId, filterDto);
  }

  @Get('low-stock')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm sắp hết hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm sắp hết hàng',
    type: ProductPaginationDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getLowStockProducts(
    @Param('storeId') storeId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findLowStockProducts(storeId, page, limit);
  }

  @Get('stats')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thống kê sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê sản phẩm',
    type: ProductStatsDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem thống kê' })
  getProductStats(@Param('storeId') storeId: string) {
    return this.productsService.getProductStats(storeId);
  }

  @Get('barcode/:barcode')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm sản phẩm theo barcode' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin sản phẩm',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  findByBarcode(
    @Param('storeId') storeId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.productsService.findByBarcode(storeId, barcode);
  }

  @Get('category/:categoryId')
  @RequireProductPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm theo danh mục' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm theo danh mục',
    type: ProductPaginationDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  findByCategory(
    @Param('storeId') storeId: string,
    @Param('categoryId') categoryId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findByCategory(
      storeId,
      categoryId,
      page,
      limit,
    );
  }

  // Bulk operations
  @Post('bulk-update')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật hàng loạt sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả cập nhật hàng loạt',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  bulkUpdateProducts(
    @Param('storeId') storeId: string,
    @Body() bulkUpdateDto: BulkUpdateRequestDto,
  ) {
    return this.productsService.bulkUpdateProducts(storeId, bulkUpdateDto);
  }

  @Post('bulk-delete')
  @RequireProductPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa hàng loạt sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xóa hàng loạt',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  bulkDeleteProducts(
    @Param('storeId') storeId: string,
    @Body() bulkDeleteDto: BulkDeleteRequestDto,
  ) {
    return this.productsService.bulkDeleteProducts(storeId, bulkDeleteDto);
  }

  @Post('bulk-stock-adjustment')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Điều chỉnh tồn kho hàng loạt' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả điều chỉnh tồn kho',
    type: BulkOperationResultDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  bulkStockAdjustment(
    @Param('storeId') storeId: string,
    @Body() bulkStockDto: BulkStockAdjustmentDto,
  ) {
    return this.productsService.bulkStockAdjustment(storeId, bulkStockDto);
  }

  @Patch(':id/stock')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật tồn kho sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tồn kho thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  updateStock(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body('stock') stock: number,
    @Body('updatedByUserId') updatedByUserId?: string,
  ) {
    return this.productsService.updateStock(
      storeId,
      id,
      stock,
      updatedByUserId,
    );
  }

  // Price History endpoints
  @Get(':id/price-history')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi giá sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử thay đổi giá',
    type: [PriceHistoryResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Sản phẩm không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getProductPriceHistory(
    @Param('storeId') storeId: string,
    @Param('id') productId: string,
    @Query('priceType') priceType?: string,
    @Query('limit') limit?: number,
  ) {
    return this.priceHistoriesService.findAllPriceHistories(storeId);
  }

  // Advanced Reporting endpoints
  @Get('reports/performance')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Báo cáo hiệu suất sản phẩm nâng cao' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo hiệu suất sản phẩm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem báo cáo' })
  getProductPerformanceReport(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate = to ?? new Date().toISOString().split('T')[0];
    return this.reportService.previewReport(
      storeId,
      'product-performance',
      fromDate,
      toDate,
    );
  }

  @Get('reports/analytics')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Báo cáo phân tích sản phẩm chi tiết' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo phân tích sản phẩm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem báo cáo' })
  getProductAnalyticsReport(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate = to ?? new Date().toISOString().split('T')[0];
    return this.reportService.previewReport(
      storeId,
      'product-analytics',
      fromDate,
      toDate,
    );
  }

  @Get('reports/inventory-analysis')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Báo cáo phân tích tồn kho nâng cao' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo phân tích tồn kho',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem báo cáo' })
  getInventoryAnalysisReport(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate = to ?? new Date().toISOString().split('T')[0];
    return this.reportService.previewReport(
      storeId,
      'inventory-analysis',
      fromDate,
      toDate,
    );
  }

  @Get('reports/price-trends')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Báo cáo xu hướng thay đổi giá' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo xu hướng giá',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem báo cáo' })
  getPriceTrendsReport(
    @Param('storeId') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate = to ?? new Date().toISOString().split('T')[0];
    return this.reportService.previewReport(
      storeId,
      'price-trends',
      fromDate,
      toDate,
    );
  }

  @Post('reports/export')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xuất báo cáo sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'File báo cáo được tạo',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xuất báo cáo' })
  exportProductReport(
    @Param('storeId') storeId: string,
    @Body('reportType') reportType: string,
    @Body('format') format: 'excel' | 'csv' | 'pdf' = 'excel',
    @Body('from') from?: string,
    @Body('to') to?: string,
  ) {
    const fromDate =
      from ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const toDate = to ?? new Date().toISOString().split('T')[0];
    return this.reportService.generateReport(
      storeId,
      reportType,
      fromDate,
      toDate,
      format,
    );
  }

  // Inventory Analytics endpoints
  @Post('analytics/inventory')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích tồn kho nâng cao' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo phân tích tồn kho',
    type: InventoryAnalyticsReportDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem phân tích' })
  getInventoryAnalytics(
    @Param('storeId') storeId: string,
    @Body() filterDto: InventoryAnalyticsFilterDto,
  ) {
    return this.inventoryAnalyticsService.generateInventoryAnalytics(
      storeId,
      filterDto,
    );
  }

  @Get('analytics/inventory/overview')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tổng quan tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Tổng quan tồn kho',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getInventoryOverview(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const filterDto: InventoryAnalyticsFilterDto = {
      dateFrom,
      dateTo,
      categoryId,
      analysisType: 'overview',
    };
    return this.inventoryAnalyticsService.generateOverview(storeId, filterDto);
  }

  @Get('analytics/inventory/turnover')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích luân chuyển tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Phân tích luân chuyển tồn kho',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getTurnoverAnalysis(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const filterDto: InventoryAnalyticsFilterDto = {
      dateFrom,
      dateTo,
      categoryId,
      analysisType: 'turnover',
    };
    return this.inventoryAnalyticsService.generateTurnoverAnalysis(
      storeId,
      filterDto,
    );
  }

  @Get('analytics/inventory/movement')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích chuyển động tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Phân tích chuyển động tồn kho',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getMovementAnalysis(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filterDto: InventoryAnalyticsFilterDto = {
      dateFrom,
      dateTo,
      analysisType: 'movement',
    };
    return this.inventoryAnalyticsService.generateMovementAnalysis(
      storeId,
      filterDto,
    );
  }

  @Get('analytics/inventory/kpis')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'KPIs tồn kho' })
  @ApiResponse({
    status: 200,
    description: 'Các chỉ số KPI tồn kho',
    type: InventoryKPIDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getInventoryKPIs(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filterDto: InventoryAnalyticsFilterDto = {
      dateFrom,
      dateTo,
      analysisType: 'overview',
    };
    return this.inventoryAnalyticsService.calculateInventoryKPIs(
      storeId,
      filterDto,
    );
  }

  // Ví dụ về permission với điều kiện phức tạp
  @Get('store')
  @RequirePermissions({
    resource: 'products',
    action: 'list',
    conditions: [
      {
        field: 'params.storeId',
        operator: 'in',
        value: 'user.associatedStoreIds',
      },
    ],
  })
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm theo store (với kiểm tra quyền)' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm của store' })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập store này',
  })
  findByStore(@Param('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }

  // Supplier Integration endpoints
  @Get('suppliers/:supplierId/products')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm theo nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm của nhà cung cấp',
    type: SupplierProductsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSupplierProducts(
    @Param('storeId') storeId: string,
    @Param('supplierId') supplierId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy')
    sortBy?: 'name' | 'created_at' | 'product_count' | 'total_value',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    const filterDto: SupplierProductFilterDto = {
      page: page ?? 1,
      limit: limit ?? 10,
      dateFrom,
      dateTo,
      sortBy: sortBy ?? 'name',
      sortOrder: sortOrder ?? 'ASC',
    };
    return this.supplierIntegrationService.getSupplierProducts(
      storeId,
      supplierId,
      filterDto,
    );
  }

  @Get('suppliers/performance')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích hiệu suất nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Hiệu suất nhà cung cấp',
    type: [SupplierPerformanceDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSupplierPerformance(
    @Param('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filterDto: SupplierProductFilterDto = {
      dateFrom,
      dateTo,
    };
    return this.supplierIntegrationService.getSupplierPerformance(
      storeId,
      filterDto,
    );
  }

  @Get('suppliers/analytics')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Phân tích tổng quan nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Phân tích tổng quan nhà cung cấp',
    type: SupplierAnalyticsDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSupplierAnalytics(@Param('storeId') storeId: string) {
    return this.supplierIntegrationService.getSupplierAnalytics(storeId);
  }

  @Post('suppliers/assign')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Gán nhà cung cấp cho sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả gán nhà cung cấp',
    type: SupplierOperationResultDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  assignSupplierToProducts(
    @Param('storeId') storeId: string,
    @Body() assignDto: AssignSupplierDto,
  ) {
    return this.supplierIntegrationExtendedService.assignSupplierToProducts(
      storeId,
      assignDto,
    );
  }

  @Post('suppliers/unassign')
  @RequireProductPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Hủy gán nhà cung cấp khỏi sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả hủy gán nhà cung cấp',
    type: SupplierOperationResultDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  unassignSupplierFromProducts(
    @Param('storeId') storeId: string,
    @Body() unassignDto: UnassignSupplierDto,
  ) {
    return this.supplierIntegrationExtendedService.unassignSupplierFromProducts(
      storeId,
      unassignDto,
    );
  }

  @Get('products/without-supplier')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm chưa có nhà cung cấp' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm chưa có nhà cung cấp',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getProductsWithoutSupplier(
    @Param('storeId') storeId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supplierIntegrationExtendedService.getProductsWithoutSupplier(
      storeId,
      page ?? 1,
      limit ?? 10,
    );
  }

  @Get('suppliers/summary')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tóm tắt nhà cung cấp với số lượng sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Tóm tắt nhà cung cấp',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSuppliersWithProductCounts(@Param('storeId') storeId: string) {
    return this.supplierIntegrationExtendedService.getSuppliersWithProductCounts(
      storeId,
    );
  }

  // Product Recommendations endpoints
  @Get('recommendations/:productId')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy gợi ý sản phẩm liên quan' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm gợi ý',
    type: ProductRecommendationsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getProductRecommendations(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('type')
    recommendationType?:
      | 'similar'
      | 'related'
      | 'frequently_bought_together'
      | 'price_based'
      | 'category_based'
      | 'brand_based',
    @Query('limit') limit?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('inStockOnly') inStockOnly?: boolean,
    @Query('activeOnly') activeOnly?: boolean,
  ) {
    const filterDto: ProductRecommendationFilterDto = {
      productId,
      recommendationType: recommendationType ?? 'similar',
      limit: limit ?? 10,
      minPrice,
      maxPrice,
      inStockOnly: inStockOnly !== false,
      activeOnly: activeOnly !== false,
    };
    return this.productRecommendationsService.getProductRecommendations(
      storeId,
      filterDto,
    );
  }

  @Post('recommendations/bulk')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy gợi ý sản phẩm cho nhiều sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Gợi ý sản phẩm hàng loạt',
    type: BulkRecommendationResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getBulkRecommendations(
    @Param('storeId') storeId: string,
    @Body() requestDto: BulkRecommendationRequestDto,
  ) {
    return this.productRecommendationsService.getBulkRecommendations(
      storeId,
      requestDto,
    );
  }

  @Get('recommendations/:productId/similar')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm tương tự' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm tương tự',
    type: ProductRecommendationsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSimilarProducts(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    const filterDto: ProductRecommendationFilterDto = {
      productId,
      recommendationType: 'similar',
      limit: limit ?? 10,
    };
    return this.productRecommendationsService.getProductRecommendations(
      storeId,
      filterDto,
    );
  }

  @Get('recommendations/:productId/category')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm cùng danh mục' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm cùng danh mục',
    type: ProductRecommendationsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getCategoryBasedRecommendations(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    const filterDto: ProductRecommendationFilterDto = {
      productId,
      recommendationType: 'category_based',
      limit: limit ?? 10,
    };
    return this.productRecommendationsService.getProductRecommendations(
      storeId,
      filterDto,
    );
  }

  @Get('recommendations/:productId/brand')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm cùng thương hiệu' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm cùng thương hiệu',
    type: ProductRecommendationsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getBrandBasedRecommendations(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    const filterDto: ProductRecommendationFilterDto = {
      productId,
      recommendationType: 'brand_based',
      limit: limit ?? 10,
    };
    return this.productRecommendationsService.getProductRecommendations(
      storeId,
      filterDto,
    );
  }

  @Get('recommendations/:productId/price-range')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy sản phẩm cùng tầm giá' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm cùng tầm giá',
    type: ProductRecommendationsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getPriceBasedRecommendations(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    const filterDto: ProductRecommendationFilterDto = {
      productId,
      recommendationType: 'price_based',
      limit: limit ?? 10,
    };
    return this.productRecommendationsService.getProductRecommendations(
      storeId,
      filterDto,
    );
  }

  // Advanced Search endpoints
  @Post('search/advanced')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm nâng cao với full-text search' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả tìm kiếm nâng cao',
    type: AdvancedSearchResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  advancedSearch(
    @Param('storeId') storeId: string,
    @Body() searchDto: AdvancedSearchDto,
  ) {
    return this.advancedSearchService.advancedSearch(storeId, searchDto);
  }

  @Get('search/suggestions')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy gợi ý tìm kiếm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách gợi ý tìm kiếm',
    type: SearchSuggestionsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  getSearchSuggestions(
    @Param('storeId') storeId: string,
    @Query('q') query: string,
  ) {
    return this.advancedSearchService.getSearchSuggestions(storeId, query);
  }

  @Get('search')
  @RequireProductPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm với query parameters' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả tìm kiếm',
    type: AdvancedSearchResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  searchProductsAdvanced(
    @Param('storeId') storeId: string,
    @Query('q') query?: string,
    @Query('type')
    searchType?: 'simple' | 'phrase' | 'boolean' | 'fuzzy' | 'wildcard',
    @Query('fields') searchFields?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy')
    sortBy?: 'relevance' | 'name' | 'price' | 'created_at' | 'stock',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('highlight') highlight?: boolean,
    @Query('categoryIds') categoryIds?: string,
    @Query('brands') brands?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const searchDto: AdvancedSearchDto = {
      query,
      searchType: searchType ?? 'simple',
      searchFields: searchFields ? (searchFields.split(',') as any) : ['all'],
      page: page ?? 1,
      limit: limit ?? 10,
      sortBy: sortBy ?? 'relevance',
      sortOrder: sortOrder ?? 'DESC',
      highlight: highlight !== false,
      categoryIds: categoryIds ? categoryIds.split(',') : undefined,
      brands: brands ? brands.split(',') : undefined,
      minPrice,
      maxPrice,
    };
    return this.advancedSearchService.advancedSearch(storeId, searchDto);
  }

  @Get('report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a product report' })
  async generateProductReport(
    @Param('storeId') storeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reportService.exportReport(storeId, 'products', from, to);
  }
}
