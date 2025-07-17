import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: 'Tên nhãn', example: 'VIP' })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiProperty({
    description: 'Mô tả nhãn',
    example: 'Khách hàng VIP',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Màu sắc (hex code)',
    example: '#FF0000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code',
  })
  color?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'ID người tạo', required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;
}
