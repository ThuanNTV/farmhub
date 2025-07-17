import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ description: 'ID sản phẩm', type: String, format: 'uuid' })
  @Expose({ name: 'productId' })
  productId!: string;

  @ApiProperty({ description: 'Mã sản phẩm (SKU)', example: 'SP001' })
  @Expose({ name: 'productCode' })
  productCode!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón hữu cơ' })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'Slug SEO-friendly của sản phẩm',
    example: 'phan-bon-huu-co',
  })
  @Expose()
  slug!: string;

  @ApiProperty({
    description: 'Mô tả chi tiết sản phẩm',
    example: 'Sản phẩm dùng cho cây trồng hữu cơ',
  })
  @Expose()
  description!: string;

  @ApiProperty({
    description: 'ID danh mục sản phẩm',
    type: String,
    format: 'uuid',
  })
  @Expose({ name: 'categoryId' })
  categoryId!: string;

  @ApiProperty({
    required: false,
    description: 'Thương hiệu của sản phẩm',
    example: 'NPK',
  })
  @Expose()
  brand?: string;

  @ApiProperty({
    required: false,
    description: 'ID đơn vị tính',
    type: String,
    format: 'uuid',
  })
  @Expose({ name: 'unitId' })
  unitId?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 120000 })
  @Expose({ name: 'priceRetail' })
  priceRetail!: number;

  @ApiProperty({ required: false, description: 'Giá bán sỉ', example: 110000 })
  @Expose({ name: 'priceWholesale' })
  priceWholesale?: number;

  @ApiProperty({
    required: false,
    description: 'Giá bán trả góp (nếu có)',
    example: 130000,
  })
  @Expose({ name: 'creditPrice' })
  creditPrice?: number;

  @ApiProperty({ required: false, description: 'Giá vốn', example: 100000 })
  @Expose({ name: 'costPrice' })
  costPrice?: number;

  @ApiProperty({ required: false, description: 'Barcode sản phẩm' })
  @Expose()
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', example: 100 })
  @Expose()
  stock!: number;

  @ApiProperty({ description: 'Ngưỡng tồn kho', example: 10 })
  @Expose({ name: 'minStockLevel' })
  minStockLevel!: number;

  @ApiProperty({ required: false, description: 'Hình ảnh (JSON/text)' })
  @Expose()
  images?: string;

  @ApiProperty({
    required: false,
    description: 'Thông số kỹ thuật (JSON/text)',
  })
  @Expose()
  specs?: string;

  @ApiProperty({ required: false, description: 'Thông tin bảo hành' })
  @Expose({ name: 'warrantyInfo' })
  warrantyInfo?: string;

  @ApiProperty({ required: false, description: 'ID nhà cung cấp' })
  @Expose({ name: 'supplierId' })
  supplierId?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  @Expose({ name: 'isActive' })
  isActive!: boolean;

  @ApiProperty({ description: 'Trạng thái xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({
    description: 'Thời gian tạo bản ghi',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật gần nhất',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ required: false, description: 'Người tạo' })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'Người cập nhật cuối' })
  @Exclude()
  updatedByUserId?: string;
}
