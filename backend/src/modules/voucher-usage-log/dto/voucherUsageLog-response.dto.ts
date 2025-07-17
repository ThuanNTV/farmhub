import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class VoucherUsageLogResponseDto {
  @ApiProperty({ description: 'ID log' })
  id!: string;

  @ApiProperty({ description: 'ID cửa hàng' })
  storeId!: string;

  @ApiProperty({ description: 'ID voucher' })
  voucherId!: string;

  @ApiProperty({ description: 'Mã voucher' })
  voucherCode!: string;

  @ApiProperty({ description: 'ID người dùng' })
  userId!: string;

  @ApiProperty({ description: 'Tên người dùng' })
  userName!: string;

  @ApiProperty({ description: 'ID đơn hàng', required: false })
  orderId?: string;

  @ApiProperty({ description: 'Mã đơn hàng', required: false })
  orderCode?: string;

  @ApiProperty({ description: 'Số tiền giảm giá' })
  discountAmount!: number;

  @ApiProperty({ description: 'Tổng tiền trước giảm giá' })
  orderTotalBeforeDiscount!: number;

  @ApiProperty({ description: 'Tổng tiền sau giảm giá' })
  orderTotalAfterDiscount!: number;

  @ApiProperty({ description: 'IP address', required: false })
  @Exclude()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @Exclude()
  userAgent?: string;

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt!: Date;
}
