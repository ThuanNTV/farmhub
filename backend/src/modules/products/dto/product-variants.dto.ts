import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AttributeType,
  AttributeInputType,
} from 'src/entities/tenant/product_attribute.entity';

export class CreateProductAttributeDto {
  @ApiProperty({ description: 'Tên thuộc tính', example: 'size' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Tên hiển thị', example: 'Kích thước' })
  @IsString()
  displayName!: string;

  @ApiProperty({
    description: 'Mô tả thuộc tính',
    required: false,
    example: 'Kích thước sản phẩm',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Loại thuộc tính',
    enum: AttributeType,
    example: AttributeType.SIZE,
  })
  @IsEnum(AttributeType)
  type!: AttributeType;

  @ApiProperty({
    description: 'Loại input',
    enum: AttributeInputType,
    example: AttributeInputType.DROPDOWN,
  })
  @IsEnum(AttributeInputType)
  inputType!: AttributeInputType;

  @ApiProperty({ description: 'Tùy chọn thuộc tính', required: false })
  @IsOptional()
  options?: {
    values?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      pattern?: string;
      minLength?: number;
      maxLength?: number;
    };
  };

  @ApiProperty({ description: 'Đơn vị', required: false, example: 'cm' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Bắt buộc', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({
    description: 'Định nghĩa biến thể',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isVariantDefining?: boolean;

  @ApiProperty({ description: 'Có thể lọc', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiProperty({
    description: 'Có thể tìm kiếm',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Nhóm thuộc tính',
    required: false,
    example: 'Kích thước & Trọng lượng',
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ description: 'Văn bản trợ giúp', required: false })
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiProperty({ description: 'Giá trị mặc định', required: false })
  @IsOptional()
  @IsString()
  defaultValue?: string;
}

export class ProductVariantAttributeDto {
  @ApiProperty({ description: 'ID thuộc tính', example: 'attr-001' })
  @IsString()
  attributeId!: string;

  @ApiProperty({ description: 'Giá trị thuộc tính', example: 'L' })
  @IsString()
  value!: string;

  @ApiProperty({
    description: 'Giá trị hiển thị',
    required: false,
    example: 'Large',
  })
  @IsOptional()
  @IsString()
  displayValue?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductVariantDto {
  @ApiProperty({ description: 'ID sản phẩm gốc', example: 'prod-001' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'SKU biến thể', example: 'PROD-001-L-RED' })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: 'Tên biến thể',
    example: 'Áo thun size L màu đỏ',
  })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Mô tả biến thể', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 150000 })
  @IsNumber()
  @Min(0)
  priceRetail!: number;

  @ApiProperty({ description: 'Giá bán sỉ', required: false, example: 130000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceWholesale?: number;

  @ApiProperty({ description: 'Giá vốn', required: false, example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    description: 'Mã vạch',
    required: false,
    example: '1234567890124',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', example: 50 })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({ description: 'Mức tồn kho tối thiểu', example: 5 })
  @IsNumber()
  @Min(0)
  minStockLevel!: number;

  @ApiProperty({ description: 'Trọng lượng', required: false, example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: 'Đơn vị trọng lượng',
    required: false,
    example: 'kg',
  })
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiProperty({ description: 'Kích thước', required: false })
  @IsOptional()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @ApiProperty({ description: 'Hình ảnh', required: false })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({
    description: 'Biến thể mặc định',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Danh sách thuộc tính',
    type: [ProductVariantAttributeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantAttributeDto)
  attributes!: ProductVariantAttributeDto[];
}

export class UpdateProductVariantDto {
  @ApiProperty({ description: 'Tên biến thể', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Mô tả biến thể', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Giá bán lẻ', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceRetail?: number;

  @ApiProperty({ description: 'Giá bán sỉ', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceWholesale?: number;

  @ApiProperty({ description: 'Giá vốn', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Mã vạch', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ description: 'Mức tồn kho tối thiểu', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @ApiProperty({ description: 'Trọng lượng', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Đơn vị trọng lượng', required: false })
  @IsOptional()
  @IsString()
  weightUnit?: string;

  @ApiProperty({ description: 'Kích thước', required: false })
  @IsOptional()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @ApiProperty({ description: 'Hình ảnh', required: false })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Biến thể mặc định', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Danh sách thuộc tính',
    required: false,
    type: [ProductVariantAttributeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantAttributeDto)
  attributes?: ProductVariantAttributeDto[];
}

export class ProductAttributeResponseDto {
  @ApiProperty({ description: 'ID thuộc tính', example: 'attr-001' })
  attributeId!: string;

  @ApiProperty({ description: 'Tên thuộc tính', example: 'size' })
  name!: string;

  @ApiProperty({ description: 'Tên hiển thị', example: 'Kích thước' })
  displayName!: string;

  @ApiProperty({
    description: 'Mô tả thuộc tính',
    example: 'Kích thước sản phẩm',
  })
  description?: string;

  @ApiProperty({ description: 'Loại thuộc tính', enum: AttributeType })
  type!: AttributeType;

  @ApiProperty({ description: 'Loại input', enum: AttributeInputType })
  inputType!: AttributeInputType;

  @ApiProperty({ description: 'Tùy chọn thuộc tính' })
  options?: any;

  @ApiProperty({ description: 'Đơn vị', example: 'cm' })
  unit?: string;

  @ApiProperty({ description: 'Bắt buộc', example: false })
  isRequired!: boolean;

  @ApiProperty({ description: 'Định nghĩa biến thể', example: true })
  isVariantDefining!: boolean;

  @ApiProperty({ description: 'Có thể lọc', example: true })
  isFilterable!: boolean;

  @ApiProperty({ description: 'Có thể tìm kiếm', example: false })
  isSearchable!: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp', example: 0 })
  sortOrder!: number;

  @ApiProperty({
    description: 'Nhóm thuộc tính',
    example: 'Kích thước & Trọng lượng',
  })
  groupName?: string;

  @ApiProperty({ description: 'Văn bản trợ giúp' })
  helpText?: string;

  @ApiProperty({ description: 'Giá trị mặc định' })
  defaultValue?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-20T14:20:00Z',
  })
  updatedAt!: Date;
}

export class ProductVariantAttributeResponseDto {
  @ApiProperty({
    description: 'ID thuộc tính biến thể',
    example: 'var-attr-001',
  })
  variantAttributeId!: string;

  @ApiProperty({ description: 'ID thuộc tính', example: 'attr-001' })
  attributeId!: string;

  @ApiProperty({
    description: 'Thông tin thuộc tính',
    type: ProductAttributeResponseDto,
  })
  attribute!: ProductAttributeResponseDto;

  @ApiProperty({ description: 'Giá trị thuộc tính', example: 'L' })
  value!: string;

  @ApiProperty({ description: 'Giá trị hiển thị', example: 'Large' })
  displayValue?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', example: 0 })
  sortOrder!: number;
}

export class ProductVariantResponseDto {
  @ApiProperty({ description: 'ID biến thể', example: 'var-001' })
  variantId!: string;

  @ApiProperty({ description: 'ID sản phẩm gốc', example: 'prod-001' })
  productId!: string;

  @ApiProperty({ description: 'SKU biến thể', example: 'PROD-001-L-RED' })
  sku!: string;

  @ApiProperty({
    description: 'Tên biến thể',
    example: 'Áo thun size L màu đỏ',
  })
  name!: string;

  @ApiProperty({ description: 'Mô tả biến thể' })
  description?: string;

  @ApiProperty({ description: 'Giá bán lẻ', example: 150000 })
  priceRetail!: number;

  @ApiProperty({ description: 'Giá bán sỉ', example: 130000 })
  priceWholesale?: number;

  @ApiProperty({ description: 'Giá vốn', example: 100000 })
  costPrice?: number;

  @ApiProperty({ description: 'Mã vạch', example: '1234567890124' })
  barcode?: string;

  @ApiProperty({ description: 'Tồn kho', example: 50 })
  stock!: number;

  @ApiProperty({ description: 'Mức tồn kho tối thiểu', example: 5 })
  minStockLevel!: number;

  @ApiProperty({ description: 'Trọng lượng', example: 0.5 })
  weight?: number;

  @ApiProperty({ description: 'Đơn vị trọng lượng', example: 'kg' })
  weightUnit?: string;

  @ApiProperty({ description: 'Kích thước' })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @ApiProperty({ description: 'Hình ảnh' })
  images?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', example: 0 })
  sortOrder!: number;

  @ApiProperty({ description: 'Biến thể mặc định', example: false })
  isDefault!: boolean;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-20T14:20:00Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Danh sách thuộc tính',
    type: [ProductVariantAttributeResponseDto],
  })
  attributes!: ProductVariantAttributeResponseDto[];
}

export class ProductWithVariantsResponseDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Áo thun cotton' })
  productName!: string;

  @ApiProperty({ description: 'Mô tả sản phẩm' })
  productDescription?: string;

  @ApiProperty({
    description: 'Danh sách biến thể',
    type: [ProductVariantResponseDto],
  })
  variants!: ProductVariantResponseDto[];

  @ApiProperty({ description: 'Tổng số biến thể', example: 12 })
  totalVariants!: number;

  @ApiProperty({ description: 'Biến thể đang hoạt động', example: 10 })
  activeVariants!: number;

  @ApiProperty({ description: 'Tổng tồn kho', example: 500 })
  totalStock!: number;

  @ApiProperty({ description: 'Giá thấp nhất', example: 120000 })
  minPrice!: number;

  @ApiProperty({ description: 'Giá cao nhất', example: 180000 })
  maxPrice!: number;

  @ApiProperty({
    description: 'Danh sách thuộc tính có sẵn',
    type: [ProductAttributeResponseDto],
  })
  availableAttributes!: ProductAttributeResponseDto[];
}

export class VariantFilterDto {
  @ApiProperty({ description: 'ID sản phẩm', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Có tồn kho', required: false })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ description: 'Thuộc tính lọc', required: false })
  @IsOptional()
  attributes?: Record<string, string>;

  @ApiProperty({
    description: 'Trang hiện tại',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
