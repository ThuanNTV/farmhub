import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'ID không được để trống' })
  id!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã sản phẩm (productCode) không được để trống' })
  productCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category ID không được để trống' })
  categoryId!: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Giá phải là số hợp lệ' })
  @IsPositive({ message: 'Giá phải lớn hơn 0' })
  price!: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá trả góp phải là số hợp lệ' },
  )
  creditPrice?: number;

  @IsOptional()
  @IsInt({ message: 'Tồn kho phải là số nguyên' })
  @Min(0, { message: 'Tồn kho không được nhỏ hơn 0' })
  stock?: number;

  @IsOptional()
  @IsInt({ message: 'Ngưỡng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng tồn kho không được nhỏ hơn 0' })
  min_stock_level?: number;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi JSON' }) // Hoặc dùng @IsJSON nếu cần validate kỹ
  images?: string;

  @IsOptional()
  @IsString({ message: 'Thông số kỹ thuật phải là chuỗi JSON' })
  specs?: string;

  @IsOptional()
  @IsString({ message: 'Thông tin bảo hành phải là chuỗi' })
  warrantyInfo?: string;

  @IsOptional()
  @IsString({ message: 'Supplier ID phải là chuỗi' })
  supplierId?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true hoặc false' })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDeleted phải là true hoặc false' })
  isDeleted?: boolean;
}
