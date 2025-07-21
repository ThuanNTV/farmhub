import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSearchDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên, mô tả, barcode)',
    required: false,
    example: 'phân bón',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

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
