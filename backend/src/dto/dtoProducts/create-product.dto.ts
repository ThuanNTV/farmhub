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
  @IsString()
  @IsNotEmpty({ message: 'ID không được để trống' })
  productId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã sản phẩm (productCode) không được để trống' })
  productCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MaxLength(255, { message: 'Tên sản phẩm tối đa 255 ký tự' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Danh mục (categoryId) không được để trống' })
  categoryId!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Giá phải là số hợp lệ' })
  @IsPositive({ message: 'Giá phải lớn hơn 0' })
  price!: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá trả góp phải là số hợp lệ' },
  )
  @Min(0)
  creditPrice?: number;

  @IsOptional()
  @IsInt({ message: 'Tồn kho phải là số nguyên' })
  @Min(0, { message: 'Tồn kho không được nhỏ hơn 0' })
  stock?: number = 0;

  @IsOptional()
  @IsInt({ message: 'Ngưỡng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Ngưỡng tồn kho không được nhỏ hơn 0' })
  minStockLevel?: number = 0;

  @IsOptional()
  @IsString({ message: 'Hình ảnh phải là chuỗi JSON hoặc text' }) // Nếu dùng TEXT
  images?: string;

  @IsOptional()
  @IsString({ message: 'Thông số kỹ thuật phải là chuỗi JSON hoặc text' })
  specs?: string;

  @IsOptional()
  @IsString()
  warrantyInfo?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean = false;
}
