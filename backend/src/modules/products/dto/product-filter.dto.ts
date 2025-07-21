import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductFilterDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    required: false,
    example: 'phân bón hữu cơ',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'ID danh mục sản phẩm',
    required: false,
    example: 'cat-001',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Danh sách ID danh mục',
    required: false,
    type: [String],
    example: ['cat-001', 'cat-002'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    description: 'ID nhà cung cấp',
    required: false,
    example: 'sup-001',
  })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({
    description: 'Thương hiệu',
    required: false,
    example: 'NPK',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: 'Giá tối thiểu',
    required: false,
    minimum: 0,
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Giá tối đa',
    required: false,
    minimum: 0,
    example: 500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Tồn kho tối thiểu',
    required: false,
    minimum: 0,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiProperty({
    description: 'Tồn kho tối đa',
    required: false,
    minimum: 0,
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiProperty({
    description: 'Chỉ hiển thị sản phẩm sắp hết hàng',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lowStock?: boolean;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Ngày tạo từ',
    required: false,
    type: String,
    format: 'date',
    example: '2024-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiProperty({
    description: 'Ngày tạo đến',
    required: false,
    type: String,
    format: 'date',
    example: '2024-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  dateTo?: Date;

  @ApiProperty({
    description: 'Trang hiện tại',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng sản phẩm mỗi trang',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sắp xếp theo trường',
    required: false,
    enum: ['name', 'price_retail', 'stock', 'created_at', 'updated_at'],
    default: 'created_at',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'price_retail' | 'stock' | 'created_at' | 'updated_at' =
    'created_at';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'ASC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
