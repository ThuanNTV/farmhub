import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CreateTagDto } from 'src/modules/tag/dto/create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @ApiProperty({ description: 'Tên nhãn', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Mô tả nhãn', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Màu sắc', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
