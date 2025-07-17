import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class BankResponseDto {
  @ApiProperty({ description: 'ID ngân hàng' })
  @Expose({ name: 'id' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Tên ngân hàng' })
  @Expose({ name: 'name' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ description: 'Người tạo' })
  @Expose({ name: 'createdByUserId' })
  @Exclude()
  @IsString()
  createdByUserId!: string;

  @ApiProperty({ description: 'Người cập nhật', required: false })
  @Expose({ name: 'updatedByUserId' })
  @Exclude()
  @IsOptional()
  @IsString()
  updatedByUserId?: string;

  @ApiProperty({ description: 'Đã xóa' })
  @Expose({ name: 'isDeleted' })
  @Exclude()
  @IsBoolean()
  isDeleted!: boolean;
}
