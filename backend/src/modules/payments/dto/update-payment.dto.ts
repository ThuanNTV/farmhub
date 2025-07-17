import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsUUID, IsEnum } from 'class-validator';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus } from '../../../entities/tenant/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({
    type: String,
    description: 'Số tiền thanh toán (dạng chuỗi)',
    required: false,
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    description: 'Thời điểm đã thanh toán',
  })
  @IsOptional()
  @IsDate()
  paidAt?: Date;

  @ApiProperty({
    format: 'uuid',
    description: 'Phương thức thanh toán',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiProperty({
    enum: PaymentStatus,
    description: 'Trạng thái thanh toán',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ description: 'Ghi chú', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
