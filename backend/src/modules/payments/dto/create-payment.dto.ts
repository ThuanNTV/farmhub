import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumberString,
  IsOptional,
  IsDateString,
  IsString,
  IsEnum,
} from 'class-validator';
import { PaymentStatus } from '../../../entities/tenant/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID đơn hàng' })
  @IsUUID()
  orderId!: string; // maps to order_id

  @ApiProperty({ description: 'Số tiền thanh toán' })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ description: 'Thời điểm đã thanh toán', required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: Date; // maps to paid_at

  @ApiProperty({ description: 'ID phương thức thanh toán' })
  @IsString()
  paymentMethodId!: string; // maps to payment_method_id

  @ApiProperty({ enum: PaymentStatus, description: 'Trạng thái thanh toán' })
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'ID người thanh toán', required: false })
  @IsOptional()
  @IsUUID()
  paidByUserId?: string; // maps to paid_by_user_id
}
