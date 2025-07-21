import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber, IsBoolean, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdateProductDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'Giá bán lẻ mới', required: false, example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRetail?: number;

  @ApiProperty({ description: 'Giá bán sỉ mới', required: false, example: 140000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceWholesale?: number;

  @ApiProperty({ description: 'Tồn kho mới', required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Danh mục mới', required: false, example: 'cat-002' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Thương hiệu mới', required: false, example: 'Brand X' })
  @IsOptional()
  @IsString()
  brand?: string;
}

export class BulkUpdateRequestDto {
  @ApiProperty({ 
    description: 'Danh sách cập nhật sản phẩm', 
    type: [BulkUpdateProductDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateProductDto)
  products!: BulkUpdateProductDto[];

  @ApiProperty({ description: 'ID người thực hiện', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}

export class BulkDeleteRequestDto {
  @ApiProperty({ 
    description: 'Danh sách ID sản phẩm cần xóa', 
    type: [String],
    example: ['prod-001', 'prod-002', 'prod-003']
  })
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @ApiProperty({ description: 'ID người thực hiện', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}

export class BulkOperationResultDto {
  @ApiProperty({ description: 'Số lượng thành công', example: 8 })
  successCount!: number;

  @ApiProperty({ description: 'Số lượng thất bại', example: 2 })
  failureCount!: number;

  @ApiProperty({ description: 'Tổng số items', example: 10 })
  totalCount!: number;

  @ApiProperty({ 
    description: 'Danh sách lỗi', 
    type: [String],
    example: ['Product prod-001 not found', 'Invalid price for prod-002']
  })
  errors!: string[];

  @ApiProperty({ 
    description: 'Danh sách ID thành công', 
    type: [String],
    example: ['prod-003', 'prod-004', 'prod-005']
  })
  successIds!: string[];

  @ApiProperty({ 
    description: 'Danh sách ID thất bại', 
    type: [String],
    example: ['prod-001', 'prod-002']
  })
  failureIds!: string[];
}

export class StockAdjustmentDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'Số lượng thay đổi (có thể âm)', example: -5 })
  @IsNumber()
  adjustment!: number;

  @ApiProperty({ description: 'Lý do thay đổi', example: 'Kiểm kê định kỳ' })
  @IsString()
  reason!: string;
}

export class BulkStockAdjustmentDto {
  @ApiProperty({ 
    description: 'Danh sách điều chỉnh tồn kho', 
    type: [StockAdjustmentDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentDto)
  adjustments!: StockAdjustmentDto[];

  @ApiProperty({ description: 'ID người thực hiện', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}
