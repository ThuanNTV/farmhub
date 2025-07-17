import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from 'class-validator';

export class TagResponseDto {
  @ApiProperty({ description: 'ID nhãn' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'ID cửa hàng' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ description: 'Tên nhãn' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Mô tả nhãn', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Màu sắc', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ description: 'ID người tạo', required: false })
  @IsOptional()
  @IsUUID()
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ description: 'ID người cập nhật', required: false })
  @IsOptional()
  @IsUUID()
  @Exclude()
  updatedByUserId?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  @IsDate()
  updatedAt!: Date;
}
