import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Loại thông báo (ví dụ: "order", "promotion", v.v.)',
  })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsString()
  title!: string;

  @ApiProperty({
    required: false,
    description: 'Mô tả chi tiết của thông báo (nếu có)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Liên kết liên quan đến thông báo (nếu có)',
  })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'Đánh dấu đã đọc hay chưa', default: false })
  @IsBoolean()
  isRead!: boolean;

  @ApiProperty({ required: false, description: 'ID người tạo thông báo' })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false, description: 'ID người cập nhật gần nhất' })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
