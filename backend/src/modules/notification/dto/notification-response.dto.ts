import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from 'class-validator';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID thông báo' })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'Loại thông báo' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsString()
  title!: string;

  @ApiProperty({ required: false, description: 'Mô tả chi tiết (nếu có)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Đường dẫn liên kết (nếu có)' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'Trạng thái đã đọc' })
  @IsBoolean()
  isRead!: boolean;

  @ApiProperty({ description: 'Thời điểm tạo thông báo' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ required: false, description: 'ID người tạo' })
  @IsOptional()
  @IsUUID()
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người cập nhật' })
  @IsOptional()
  @IsUUID()
  @Exclude()
  updatedByUserId?: string;
}
