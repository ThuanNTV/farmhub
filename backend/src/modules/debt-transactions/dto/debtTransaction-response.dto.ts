import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DebtTransactionStatus } from '../../../entities/tenant/debt_transaction.entity';

export class DebtTransactionResponseDto {
  @ApiProperty({ description: 'Debt transaction ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Customer ID' })
  @Expose({ name: 'customerId' })
  customerId!: string;

  @ApiProperty({ description: 'Amount' })
  @Expose()
  amount!: string;

  @ApiProperty({ description: 'Payment method ID' })
  @Expose({ name: 'paymentMethodId' })
  paymentMethodId!: string;

  @ApiProperty({ description: 'Paid by user ID' })
  @Expose({ name: 'paidByUserId' })
  paidByUserId!: string;

  @ApiProperty({ description: 'Paid at' })
  @Expose({ name: 'paidAt' })
  paidAt!: Date;

  @ApiProperty({ description: 'Status', enum: DebtTransactionStatus })
  @Expose()
  status!: DebtTransactionStatus;

  @ApiProperty({ description: 'Note', required: false })
  @Expose()
  note?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;
}
