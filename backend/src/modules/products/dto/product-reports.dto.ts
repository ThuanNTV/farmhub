import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductReportFilterDto {
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
    description: 'Loại báo cáo', 
    enum: ['overview', 'sales', 'inventory', 'performance', 'trends'],
    required: false,
    default: 'overview'
  })
  @IsOptional()
  @IsEnum(['overview', 'sales', 'inventory', 'performance', 'trends'])
  reportType?: 'overview' | 'sales' | 'inventory' | 'performance' | 'trends' = 'overview';

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

export class ProductOverviewReportDto {
  @ApiProperty({ description: 'Tổng số sản phẩm', example: 1500 })
  totalProducts!: number;

  @ApiProperty({ description: 'Sản phẩm đang hoạt động', example: 1350 })
  activeProducts!: number;

  @ApiProperty({ description: 'Sản phẩm ngừng hoạt động', example: 150 })
  inactiveProducts!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 45 })
  lowStockProducts!: number;

  @ApiProperty({ description: 'Sản phẩm hết hàng', example: 12 })
  outOfStockProducts!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 2500000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Giá trung bình', example: 125000 })
  averagePrice!: number;

  @ApiProperty({ description: 'Số danh mục', example: 25 })
  totalCategories!: number;

  @ApiProperty({ description: 'Số thương hiệu', example: 18 })
  totalBrands!: number;

  @ApiProperty({ description: 'Số nhà cung cấp', example: 12 })
  totalSuppliers!: number;

  @ApiProperty({ description: 'Sản phẩm được tạo trong kỳ', example: 85 })
  newProductsInPeriod!: number;

  @ApiProperty({ description: 'Sản phẩm được cập nhật trong kỳ', example: 245 })
  updatedProductsInPeriod!: number;
}

export class CategoryPerformanceDto {
  @ApiProperty({ description: 'ID danh mục', example: 'cat-001' })
  categoryId!: string;

  @ApiProperty({ description: 'Tên danh mục', example: 'Phân bón' })
  categoryName!: string;

  @ApiProperty({ description: 'Số sản phẩm', example: 125 })
  productCount!: number;

  @ApiProperty({ description: 'Giá trị tồn kho', example: 450000000 })
  inventoryValue!: number;

  @ApiProperty({ description: 'Giá trung bình', example: 135000 })
  averagePrice!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 8 })
  lowStockCount!: number;

  @ApiProperty({ description: 'Phần trăm của tổng giá trị', example: 18.5 })
  valuePercentage!: number;
}

export class InventoryReportDto {
  @ApiProperty({ description: 'Tổng số lượng tồn kho', example: 15000 })
  totalStock!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 2500000000 })
  totalValue!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 45 })
  lowStockItems!: number;

  @ApiProperty({ description: 'Sản phẩm hết hàng', example: 12 })
  outOfStockItems!: number;

  @ApiProperty({ description: 'Sản phẩm tồn kho cao', example: 23 })
  overStockItems!: number;

  @ApiProperty({ description: 'Tỷ lệ luân chuyển tồn kho', example: 4.2 })
  turnoverRatio!: number;

  @ApiProperty({ description: 'Số ngày tồn kho trung bình', example: 87 })
  averageDaysInStock!: number;

  @ApiProperty({ description: 'Top sản phẩm theo giá trị', type: [Object] })
  topValueProducts!: Array<{
    productId: string;
    productName: string;
    stock: number;
    value: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Phân bố theo danh mục', type: [CategoryPerformanceDto] })
  categoryDistribution!: CategoryPerformanceDto[];
}

export class ProductTrendsDto {
  @ApiProperty({ description: 'Xu hướng tạo sản phẩm theo thời gian', type: [Object] })
  creationTrends!: Array<{
    period: string;
    count: number;
    value: number;
  }>;

  @ApiProperty({ description: 'Xu hướng cập nhật giá', type: [Object] })
  priceTrends!: Array<{
    period: string;
    priceChanges: number;
    averageChange: number;
    increaseCount: number;
    decreaseCount: number;
  }>;

  @ApiProperty({ description: 'Xu hướng tồn kho', type: [Object] })
  stockTrends!: Array<{
    period: string;
    totalStock: number;
    lowStockCount: number;
    stockValue: number;
  }>;

  @ApiProperty({ description: 'Top sản phẩm tăng trưởng', type: [Object] })
  growingProducts!: Array<{
    productId: string;
    productName: string;
    growthRate: number;
    currentValue: number;
    previousValue: number;
  }>;

  @ApiProperty({ description: 'Top sản phẩm suy giảm', type: [Object] })
  decliningProducts!: Array<{
    productId: string;
    productName: string;
    declineRate: number;
    currentValue: number;
    previousValue: number;
  }>;
}

export class ProductPerformanceReportDto {
  @ApiProperty({ description: 'Báo cáo tổng quan', type: ProductOverviewReportDto })
  overview!: ProductOverviewReportDto;

  @ApiProperty({ description: 'Báo cáo tồn kho', type: InventoryReportDto })
  inventory!: InventoryReportDto;

  @ApiProperty({ description: 'Xu hướng sản phẩm', type: ProductTrendsDto })
  trends!: ProductTrendsDto;

  @ApiProperty({ description: 'Hiệu suất theo danh mục', type: [CategoryPerformanceDto] })
  categoryPerformance!: CategoryPerformanceDto[];

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
    reportType: string;
    groupBy: string;
    filters: any;
    totalRecords: number;
    processingTime: number;
  };
}

export class ExportReportDto {
  @ApiProperty({ 
    description: 'Định dạng xuất', 
    enum: ['excel', 'csv', 'pdf'],
    example: 'excel'
  })
  @IsEnum(['excel', 'csv', 'pdf'])
  format!: 'excel' | 'csv' | 'pdf';

  @ApiProperty({ description: 'Bao gồm biểu đồ', required: false, default: true })
  @IsOptional()
  includeCharts?: boolean = true;

  @ApiProperty({ description: 'Bao gồm chi tiết', required: false, default: false })
  @IsOptional()
  includeDetails?: boolean = false;

  @ApiProperty({ description: 'Tên file tùy chỉnh', required: false })
  @IsOptional()
  @IsString()
  fileName?: string;
}
