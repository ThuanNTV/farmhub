import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'ID không được để trống' })
  categoryId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString({ message: 'Hình ảnh phải là chuỗi JSON' }) // Hoặc dùng @IsJSON nếu cần validate kỹ
  @IsOptional()
  image?: string;

  @IsOptional()
  order!: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true hoặc false' })
  isActive!: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isDeleted phải là true hoặc false' })
  isDeleted!: boolean;
}
