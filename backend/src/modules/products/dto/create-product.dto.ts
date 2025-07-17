import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty({ message: 'ID không được để trống' })
  productId!: string; // maps to product_id

  @ApiProperty({ description: 'Product code' })
  @IsString()
  @IsNotEmpty({ message: 'Mã sản phẩm (productCode) không được để trống' })
  productCode!: string; // maps to product_code

  @ApiProperty({ description: 'Product name', maxLength: 255 })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MaxLength(255, { message: 'Tên sản phẩm tối đa 255 ký tự' })
  name!: string;

  @ApiProperty({ description: 'Product slug' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug!: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description!: string;

  @ApiProperty({ description: 'Category ID' })
  @IsString()
  @IsNotEmpty({ message: 'Danh mục (categoryId) không được để trống' })
  categoryId!: string; // maps to category_id

  @ApiProperty({ description: 'Product brand', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Unit ID', required: false })
  @IsOptional()
  @IsString()
  unitId?: string; // maps to unit_id

  @ApiProperty({ description: 'Retail price', minimum: 0 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá bán lẻ phải là số hợp lệ' },
  )
  @IsPositive({ message: 'Giá bán lẻ phải lớn hơn 0' })
  priceRetail!: number; // maps to price_retail

  @ApiProperty({ description: 'Wholesale price', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá bán sỉ phải là số hợp lệ' },
  )
  priceWholesale?: number; // maps to price_wholesale

  @ApiProperty({ description: 'Credit price', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá trả góp phải là số hợp lệ' },
  )
  creditPrice?: number; // maps to credit_price

  @ApiProperty({ description: 'Cost price', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Giá vốn phải là số hợp lệ' })
  costPrice?: number; // maps to cost_price

  @ApiProperty({ description: 'Product barcode', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Stock quantity', minimum: 0 })
  @IsInt({ message: 'Tồn kho phải là số nguyên' })
  @Min(0, { message: 'Tồn kho không được nhỏ hơn 0' })
  stock!: number;

  @ApiProperty({ description: 'Minimum stock level', minimum: 0 })
  @IsInt({ message: 'Ngưỡng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng tồn kho không được nhỏ hơn 0' })
  minStockLevel!: number; // maps to min_stock_level

  @ApiProperty({ description: 'Product images (JSON string)', required: false })
  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi JSON hoặc text' })
  images?: string;

  @ApiProperty({
    description: 'Product specifications (JSON string)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Thông số kỹ thuật phải là chuỗi JSON hoặc text' })
  specs?: string;

  @ApiProperty({ description: 'Warranty information', required: false })
  @IsOptional()
  @IsString()
  warrantyInfo?: string; // maps to warranty_info

  @ApiProperty({ description: 'Supplier ID', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string; // maps to supplier_id

  @ApiProperty({ description: 'Product active status' })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ description: 'Product deleted status' })
  @IsBoolean()
  isDeleted!: boolean;

  // Audit fields (optional, backend có thể tự động gán)
  @ApiProperty({ description: 'Created by user ID', required: false })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}
