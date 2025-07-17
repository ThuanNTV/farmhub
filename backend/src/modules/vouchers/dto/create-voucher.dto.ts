import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Voucher description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Points cost for the voucher' })
  @IsNumber()
  pointsCost!: number;

  @ApiProperty({ description: 'Voucher value' })
  @IsString()
  value!: string;

  @ApiProperty({ description: 'Voucher type (fixed, percentage, shipping)' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdByUserId!: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @IsUUID()
  @IsOptional()
  updatedByUserId?: string;
}
