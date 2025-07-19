import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumberString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { DebtTransactionStatus } from 'src/entities/tenant/debt_transaction.entity';

export class CreateDebtTransactionDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId!: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  paymentMethodId!: string;

  @ApiProperty({ description: 'Paid by user ID' })
  @IsUUID()
  paidByUserId!: string;

  @ApiProperty({ description: 'Paid at' })
  @IsDateString()
  paidAt!: string;

  @ApiProperty({
    description: 'Status',
    enum: DebtTransactionStatus,
    default: DebtTransactionStatus.PENDING,
  })
  @IsEnum(DebtTransactionStatus)
  @IsOptional()
  status?: DebtTransactionStatus;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
