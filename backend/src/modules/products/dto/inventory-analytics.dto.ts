import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryAnalyticsFilterDto {
  @ApiProperty({ description: 'Ngày bắt đầu', required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Ngày kết thúc', required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'ID danh mục', required: false, example: 'cat-001' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Danh sách ID danh mục', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @ApiProperty({ description: 'ID nhà cung cấp', required: false, example: 'sup-001' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ description: 'Thương hiệu', required: false, example: 'Brand A' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ 
    description: 'Loại phân tích', 
    enum: ['overview', 'turnover', 'movement', 'transfers', 'trends'],
    required: false,
    default: 'overview'
  })
  @IsOptional()
  @IsEnum(['overview', 'turnover', 'movement', 'transfers', 'trends'])
  analysisType?: 'overview' | 'turnover' | 'movement' | 'transfers' | 'trends' = 'overview';

  @ApiProperty({ 
    description: 'Khoảng thời gian nhóm', 
    enum: ['day', 'week', 'month', 'quarter', 'year'],
    required: false,
    default: 'month'
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month';

  @ApiProperty({ description: 'Chỉ sản phẩm active', required: false, default: true })
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Bao gồm sản phẩm đã xóa', required: false, default: false })
  @IsOptional()
  includeDeleted?: boolean = false;
}

export class InventoryOverviewDto {
  @ApiProperty({ description: 'Tổng số sản phẩm', example: 1500 })
  totalProducts!: number;

  @ApiProperty({ description: 'Tổng số lượng tồn kho', example: 25000 })
  totalStock!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 5000000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 45 })
  lowStockProducts!: number;

  @ApiProperty({ description: 'Sản phẩm hết hàng', example: 12 })
  outOfStockProducts!: number;

  @ApiProperty({ description: 'Sản phẩm tồn kho cao', example: 23 })
  overStockProducts!: number;

  @ApiProperty({ description: 'Giá trị trung bình mỗi sản phẩm', example: 125000 })
  averageProductValue!: number;

  @ApiProperty({ description: 'Tỷ lệ luân chuyển tồn kho trung bình', example: 4.2 })
  averageTurnoverRatio!: number;

  @ApiProperty({ description: 'Số ngày tồn kho trung bình', example: 87 })
  averageDaysInStock!: number;

  @ApiProperty({ description: 'Số lần chuyển kho trong kỳ', example: 156 })
  totalTransfers!: number;

  @ApiProperty({ description: 'Tổng số lượng đã chuyển', example: 8500 })
  totalTransferredQuantity!: number;
}

export class ProductTurnoverDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón NPK' })
  productName!: string;

  @ApiProperty({ description: 'SKU sản phẩm', example: 'NPK-001' })
  sku?: string;

  @ApiProperty({ description: 'Danh mục', example: 'Phân bón' })
  category?: string;

  @ApiProperty({ description: 'Tồn kho hiện tại', example: 150 })
  currentStock!: number;

  @ApiProperty({ description: 'Tồn kho trung bình', example: 200 })
  averageStock!: number;

  @ApiProperty({ description: 'Số lượng đã bán', example: 800 })
  soldQuantity!: number;

  @ApiProperty({ description: 'Số lượng đã chuyển', example: 120 })
  transferredQuantity!: number;

  @ApiProperty({ description: 'Tỷ lệ luân chuyển', example: 4.5 })
  turnoverRatio!: number;

  @ApiProperty({ description: 'Số ngày tồn kho', example: 81 })
  daysInStock!: number;

  @ApiProperty({ description: 'Tốc độ di chuyển', example: 'fast' })
  movementSpeed!: 'fast' | 'medium' | 'slow' | 'stagnant';

  @ApiProperty({ description: 'Điểm hiệu suất', example: 85 })
  performanceScore!: number;
}

export class InventoryMovementDto {
  @ApiProperty({ description: 'Ngày', example: '2024-01-15' })
  date!: string;

  @ApiProperty({ description: 'Nhập kho', example: 500 })
  stockIn!: number;

  @ApiProperty({ description: 'Xuất kho', example: 350 })
  stockOut!: number;

  @ApiProperty({ description: 'Chuyển kho đi', example: 80 })
  transferOut!: number;

  @ApiProperty({ description: 'Chuyển kho đến', example: 120 })
  transferIn!: number;

  @ApiProperty({ description: 'Thay đổi ròng', example: 190 })
  netChange!: number;

  @ApiProperty({ description: 'Tồn kho cuối ngày', example: 2190 })
  endingStock!: number;

  @ApiProperty({ description: 'Giá trị tồn kho', example: 2750000 })
  stockValue!: number;
}

export class TransferAnalyticsDto {
  @ApiProperty({ description: 'ID chuyển kho', example: 'transfer-001' })
  transferId!: string;

  @ApiProperty({ description: 'Mã chuyển kho', example: 'TF-2024-001' })
  transferCode!: string;

  @ApiProperty({ description: 'Cửa hàng nguồn', example: 'store-001' })
  sourceStoreId!: string;

  @ApiProperty({ description: 'Cửa hàng đích', example: 'store-002' })
  targetStoreId!: string;

  @ApiProperty({ description: 'Trạng thái', example: 'completed' })
  status!: string;

  @ApiProperty({ description: 'Số lượng sản phẩm', example: 15 })
  itemCount!: number;

  @ApiProperty({ description: 'Tổng số lượng', example: 450 })
  totalQuantity!: number;

  @ApiProperty({ description: 'Tổng giá trị', example: 5600000 })
  totalValue!: number;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Ngày hoàn thành', example: '2024-01-16T14:20:00Z' })
  completedAt?: Date;

  @ApiProperty({ description: 'Thời gian xử lý (giờ)', example: 27.8 })
  processingTimeHours?: number;
}

export class InventoryTrendsDto {
  @ApiProperty({ description: 'Xu hướng tồn kho theo thời gian', type: [Object] })
  stockTrends!: Array<{
    period: string;
    totalStock: number;
    stockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    averageStock: number;
  }>;

  @ApiProperty({ description: 'Xu hướng luân chuyển', type: [Object] })
  turnoverTrends!: Array<{
    period: string;
    averageTurnover: number;
    fastMovingCount: number;
    slowMovingCount: number;
    stagnantCount: number;
  }>;

  @ApiProperty({ description: 'Xu hướng chuyển kho', type: [Object] })
  transferTrends!: Array<{
    period: string;
    transferCount: number;
    totalQuantity: number;
    totalValue: number;
    averageProcessingTime: number;
  }>;

  @ApiProperty({ description: 'Dự báo tồn kho', type: [Object] })
  stockForecast!: Array<{
    period: string;
    predictedStock: number;
    predictedValue: number;
    confidence: number;
  }>;
}

export class CategoryInventoryDto {
  @ApiProperty({ description: 'ID danh mục', example: 'cat-001' })
  categoryId!: string;

  @ApiProperty({ description: 'Tên danh mục', example: 'Phân bón' })
  categoryName!: string;

  @ApiProperty({ description: 'Số sản phẩm', example: 125 })
  productCount!: number;

  @ApiProperty({ description: 'Tổng tồn kho', example: 5500 })
  totalStock!: number;

  @ApiProperty({ description: 'Giá trị tồn kho', example: 6875000 })
  stockValue!: number;

  @ApiProperty({ description: 'Tỷ lệ luân chuyển trung bình', example: 3.8 })
  averageTurnover!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 8 })
  lowStockCount!: number;

  @ApiProperty({ description: 'Phần trăm giá trị', example: 18.5 })
  valuePercentage!: number;

  @ApiProperty({ description: 'Xu hướng', example: 'increasing' })
  trend!: 'increasing' | 'decreasing' | 'stable';
}

export class InventoryAnalyticsReportDto {
  @ApiProperty({ description: 'Tổng quan tồn kho', type: InventoryOverviewDto })
  overview!: InventoryOverviewDto;

  @ApiProperty({ description: 'Phân tích luân chuyển', type: [ProductTurnoverDto] })
  turnoverAnalysis!: ProductTurnoverDto[];

  @ApiProperty({ description: 'Chuyển động tồn kho', type: [InventoryMovementDto] })
  movementAnalysis!: InventoryMovementDto[];

  @ApiProperty({ description: 'Phân tích chuyển kho', type: [TransferAnalyticsDto] })
  transferAnalysis!: TransferAnalyticsDto[];

  @ApiProperty({ description: 'Xu hướng tồn kho', type: InventoryTrendsDto })
  trends!: InventoryTrendsDto;

  @ApiProperty({ description: 'Phân tích theo danh mục', type: [CategoryInventoryDto] })
  categoryAnalysis!: CategoryInventoryDto[];

  @ApiProperty({ description: 'Thời gian tạo báo cáo', example: '2024-01-15T10:30:00Z' })
  generatedAt!: Date;

  @ApiProperty({ description: 'Khoảng thời gian báo cáo' })
  reportPeriod!: {
    from: string;
    to: string;
    days: number;
  };

  @ApiProperty({ description: 'Metadata báo cáo' })
  metadata!: {
    analysisType: string;
    groupBy: string;
    filters: any;
    totalRecords: number;
    processingTime: number;
  };
}

export class InventoryKPIDto {
  @ApiProperty({ description: 'Tỷ lệ luân chuyển tồn kho', example: 4.2 })
  inventoryTurnoverRatio!: number;

  @ApiProperty({ description: 'Số ngày bán hàng tồn kho', example: 87 })
  daysOfInventoryOnHand!: number;

  @ApiProperty({ description: 'Tỷ lệ tồn kho chết', example: 5.8 })
  deadStockPercentage!: number;

  @ApiProperty({ description: 'Độ chính xác tồn kho', example: 96.5 })
  stockAccuracy!: number;

  @ApiProperty({ description: 'Tỷ lệ đáp ứng đơn hàng', example: 98.2 })
  fillRate!: number;

  @ApiProperty({ description: 'Chi phí lưu kho', example: 125000000 })
  carryingCost!: number;

  @ApiProperty({ description: 'Hiệu quả chuyển kho', example: 92.3 })
  transferEfficiency!: number;

  @ApiProperty({ description: 'Thời gian xử lý chuyển kho trung bình (giờ)', example: 24.5 })
  averageTransferTime!: number;
}
