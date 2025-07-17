import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsIP,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherUsageLogDto {
  @ApiProperty({ description: 'ID voucher' })
  @IsUUID()
  voucherId!: string;

  @ApiProperty({ description: 'ID người dùng' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'ID đơn hàng', required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'Số tiền giảm giá' })
  @IsNumber()
  @Min(0)
  discountAmount!: number;

  @ApiProperty({ description: 'Tổng tiền trước giảm giá' })
  @IsNumber()
  @Min(0)
  orderTotalBeforeDiscount!: number;

  @ApiProperty({ description: 'Tổng tiền sau giảm giá' })
  @IsNumber()
  @Min(0)
  orderTotalAfterDiscount!: number;

  @ApiProperty({ description: 'IP address', required: false })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
