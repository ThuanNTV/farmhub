import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsUUID, IsEnum } from 'class-validator';
import { PaymentStatus } from '../../../entities/tenant/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ format: 'uuid', description: 'Mã thanh toán' })
  @Expose({ name: 'id' })
  @IsUUID()
  id!: string;

  @ApiProperty({ format: 'uuid', description: 'Mã đơn hàng liên quan' })
  @Expose({ name: 'orderId' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ type: String, description: 'Số tiền thanh toán (dạng chuỗi)' })
  @Expose({ name: 'amount' })
  @IsString()
  amount!: string;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    description: 'Thời điểm đã thanh toán',
  })
  @Expose({ name: 'paidAt' })
  @IsOptional()
  @IsDate()
  paidAt?: Date;

  @ApiProperty({ format: 'uuid', description: 'Phương thức thanh toán' })
  @Expose({ name: 'paymentMethodId' })
  @IsUUID()
  paymentMethodId!: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Trạng thái thanh toán' })
  @Expose({ name: 'status' })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @Expose({ name: 'note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Người thanh toán',
    required: false,
  })
  @Expose({ name: 'paidByUserId' })
  @IsOptional()
  @IsUUID()
  @Exclude()
  paidByUserId?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Thời gian tạo bản ghi',
  })
  @Expose({ name: 'createdAt' })
  @IsDate()
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Thời gian cập nhật cuối',
  })
  @Expose({ name: 'updatedAt' })
  @IsDate()
  updatedAt!: Date;
}
