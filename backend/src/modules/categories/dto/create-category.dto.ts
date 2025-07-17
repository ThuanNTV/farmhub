import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'ID danh mục' })
  @IsString()
  @IsNotEmpty({ message: 'ID không được để trống' })
  categoryId!: string; // maps to category_id

  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name!: string;

  @ApiProperty({ description: 'Slug' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug!: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'ID danh mục cha', required: false })
  @IsString()
  @IsOptional()
  parentId?: string; // maps to parent_id

  @ApiProperty({ description: 'Hình ảnh', required: false })
  @IsString({ message: 'Hình ảnh phải là chuỗi JSON' })
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Thứ tự hiển thị', required: false })
  @IsOptional()
  @IsInt()
  displayOrder?: number; // maps to display_order

  @ApiProperty({ description: 'Hoạt động', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true hoặc false' })
  isActive?: boolean;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isDeleted phải là true hoặc false' })
  isDeleted?: boolean;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsOptional()
  @IsString()
  createdByUserId?: string;

  @ApiProperty({ description: 'Người cập nhật cuối', required: false })
  @IsOptional()
  @IsString()
  updatedByUserId?: string;
}
