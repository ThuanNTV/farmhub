import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CategoryResponseDto {
  @ApiProperty({ description: 'ID danh mục' })
  categoryId!: string;

  @ApiProperty({ description: 'Tên danh mục' })
  categoryName!: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  description?: string;

  @ApiProperty({ description: 'ID danh mục cha', required: false })
  parentId?: string;

  @ApiProperty({ description: 'Hoạt động' })
  isActive!: boolean;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Exclude()
  isDeleted!: boolean;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt!: Date;
}
