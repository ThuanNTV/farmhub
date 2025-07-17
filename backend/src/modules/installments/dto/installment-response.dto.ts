import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { InstallmentStatus } from '../../../entities/tenant/installment.entity';

export class InstallmentResponseDto {
  @ApiProperty({ description: 'Installment ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Order ID' })
  @Expose({ name: 'orderId' })
  orderId!: string;

  @ApiProperty({ description: 'Installment number' })
  @Expose({ name: 'installmentNumber' })
  installmentNumber!: number;

  @ApiProperty({ description: 'Due date' })
  @Expose({ name: 'dueDate' })
  dueDate!: Date;

  @ApiProperty({ description: 'Amount' })
  @Expose()
  amount!: string;

  @ApiProperty({ description: 'Payment method ID', required: false })
  @Expose({ name: 'paymentMethodId' })
  paymentMethodId?: string;

  @ApiProperty({ description: 'Status', enum: InstallmentStatus })
  @Expose()
  status!: InstallmentStatus;

  @ApiProperty({ description: 'Note', required: false })
  @Expose()
  note?: string;

  @ApiProperty({ description: 'Collected by user ID', required: false })
  @Exclude() // Sensitive field - exclude from response
  collectedByUserId?: string;

  @ApiProperty({ description: 'Paid at', required: false })
  @Expose({ name: 'paidAt' })
  paidAt?: Date;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;
}
