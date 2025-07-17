import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankDto {
  @ApiProperty({ description: 'Tên ngân hàng' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'ID ngân hàng', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Người tạo', required: false })
  @IsString()
  @IsOptional()
  createdByUserId?: string;
}
