import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'Tên đơn vị tính' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'ID đơn vị tính', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsString()
  @IsOptional()
  createdByUserId?: string;
}
