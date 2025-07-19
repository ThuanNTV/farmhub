import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CreateNotificationDto } from 'src/modules/notification/dto/create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ description: 'Loại thông báo', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Tiêu đề thông báo', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'Mô tả chi tiết (nếu có)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Đường dẫn liên kết (nếu có)' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ description: 'Trạng thái đã đọc', required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
