import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SupplierProductFilterDto {
  @ApiProperty({ description: 'ID nhà cung cấp', required: false, example: 'sup-001' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ description: 'Danh sách ID nhà cung cấp', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  supplierIds?: string[];

  @ApiProperty({ description: 'Tên nhà cung cấp', required: false, example: 'Công ty ABC' })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiProperty({ description: 'Ngày bắt đầu', required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Ngày kết thúc', required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Trang hiện tại', required: false, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng mỗi trang', required: false, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Sắp xếp theo', 
    enum: ['name', 'created_at', 'product_count', 'total_value'],
    required: false,
    default: 'name'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'created_at' | 'product_count' | 'total_value' = 'name';

  @ApiProperty({ 
    description: 'Thứ tự sắp xếp', 
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'ASC'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class SupplierProductDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón NPK' })
  productName!: string;

  @ApiProperty({ description: 'SKU sản phẩm', example: 'NPK-001' })
  sku?: string;

  @ApiProperty({ description: 'Mã vạch', example: '1234567890123' })
  barcode?: string;

  @ApiProperty({ description: 'Danh mục', example: 'Phân bón' })
  category?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 125000 })
  priceRetail!: number;

  @ApiProperty({ description: 'Giá bán sỉ', example: 115000 })
  priceWholesale?: number;

  @ApiProperty({ description: 'Giá vốn', example: 100000 })
  costPrice?: number;

  @ApiProperty({ description: 'Tồn kho hiện tại', example: 150 })
  currentStock!: number;

  @ApiProperty({ description: 'Mức tồn kho tối thiểu', example: 20 })
  minStockLevel!: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Ngày cập nhật cuối', example: '2024-01-20T14:20:00Z' })
  updatedAt!: Date;
}

export class SupplierSummaryDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 'sup-001' })
  supplierId!: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Công ty ABC' })
  supplierName!: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0123456789' })
  phone?: string;

  @ApiProperty({ description: 'Email', example: 'contact@abc.com' })
  email?: string;

  @ApiProperty({ description: 'Địa chỉ', example: 'Hà Nội' })
  address?: string;

  @ApiProperty({ description: 'Người liên hệ', example: 'Nguyễn Văn A' })
  contactPerson?: string;

  @ApiProperty({ description: 'Số sản phẩm', example: 25 })
  productCount!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 5000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Sản phẩm đang hoạt động', example: 23 })
  activeProducts!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 3 })
  lowStockProducts!: number;

  @ApiProperty({ description: 'Giá trung bình', example: 125000 })
  averagePrice!: number;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Ngày cập nhật cuối', example: '2024-01-20T14:20:00Z' })
  updatedAt!: Date;
}

export class SupplierProductsResponseDto {
  @ApiProperty({ description: 'Thông tin nhà cung cấp', type: SupplierSummaryDto })
  supplier!: SupplierSummaryDto;

  @ApiProperty({ description: 'Danh sách sản phẩm', type: [SupplierProductDto] })
  products!: SupplierProductDto[];

  @ApiProperty({ description: 'Thông tin phân trang' })
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class SupplierPerformanceDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 'sup-001' })
  supplierId!: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Công ty ABC' })
  supplierName!: string;

  @ApiProperty({ description: 'Số sản phẩm', example: 25 })
  productCount!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 5000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Phần trăm giá trị', example: 18.5 })
  valuePercentage!: number;

  @ApiProperty({ description: 'Tỷ lệ luân chuyển trung bình', example: 4.2 })
  averageTurnoverRatio!: number;

  @ApiProperty({ description: 'Sản phẩm bán chạy', example: 15 })
  fastMovingProducts!: number;

  @ApiProperty({ description: 'Sản phẩm bán chậm', example: 8 })
  slowMovingProducts!: number;

  @ApiProperty({ description: 'Sản phẩm sắp hết hàng', example: 3 })
  lowStockProducts!: number;

  @ApiProperty({ description: 'Điểm hiệu suất', example: 85 })
  performanceScore!: number;

  @ApiProperty({ description: 'Xu hướng', example: 'increasing' })
  trend!: 'increasing' | 'decreasing' | 'stable';

  @ApiProperty({ description: 'Đánh giá', example: 'excellent' })
  rating!: 'excellent' | 'good' | 'average' | 'poor';
}

export class SupplierAnalyticsDto {
  @ApiProperty({ description: 'Tổng số nhà cung cấp', example: 15 })
  totalSuppliers!: number;

  @ApiProperty({ description: 'Nhà cung cấp đang hoạt động', example: 12 })
  activeSuppliers!: number;

  @ApiProperty({ description: 'Tổng số sản phẩm', example: 350 })
  totalProducts!: number;

  @ApiProperty({ description: 'Tổng giá trị tồn kho', example: 75000000 })
  totalInventoryValue!: number;

  @ApiProperty({ description: 'Giá trị trung bình mỗi nhà cung cấp', example: 5000000 })
  averageValuePerSupplier!: number;

  @ApiProperty({ description: 'Số sản phẩm trung bình mỗi nhà cung cấp', example: 23 })
  averageProductsPerSupplier!: number;

  @ApiProperty({ description: 'Top nhà cung cấp theo hiệu suất', type: [SupplierPerformanceDto] })
  topPerformers!: SupplierPerformanceDto[];

  @ApiProperty({ description: 'Phân phối theo hiệu suất' })
  performanceDistribution!: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };

  @ApiProperty({ description: 'Thời gian tạo báo cáo', example: '2024-01-15T10:30:00Z' })
  generatedAt!: Date;
}

export class AssignSupplierDto {
  @ApiProperty({ description: 'ID nhà cung cấp', example: 'sup-001' })
  @IsString()
  supplierId!: string;

  @ApiProperty({ description: 'Danh sách ID sản phẩm', type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @ApiProperty({ description: 'ID người thực hiện', required: false, example: 'user-001' })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;

  @ApiProperty({ description: 'Ghi chú', required: false, example: 'Gán nhà cung cấp mới' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UnassignSupplierDto {
  @ApiProperty({ description: 'Danh sách ID sản phẩm', type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @ApiProperty({ description: 'ID người thực hiện', required: false, example: 'user-001' })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;

  @ApiProperty({ description: 'Ghi chú', required: false, example: 'Hủy gán nhà cung cấp' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class SupplierOperationResultDto {
  @ApiProperty({ description: 'Số lượng thành công', example: 8 })
  successCount!: number;

  @ApiProperty({ description: 'Số lượng thất bại', example: 2 })
  failureCount!: number;

  @ApiProperty({ description: 'Tổng số lượng', example: 10 })
  totalCount!: number;

  @ApiProperty({ description: 'Danh sách lỗi', type: [String] })
  errors!: string[];

  @ApiProperty({ description: 'Danh sách ID thành công', type: [String] })
  successIds!: string[];

  @ApiProperty({ description: 'Danh sách ID thất bại', type: [String] })
  failureIds!: string[];

  @ApiProperty({ description: 'Thông tin nhà cung cấp' })
  supplierInfo?: {
    supplierId: string;
    supplierName: string;
  };
}
