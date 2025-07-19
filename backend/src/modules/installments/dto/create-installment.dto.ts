import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsDateString,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { InstallmentStatus } from 'src/entities/tenant/installment.entity';

export class CreateInstallmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId!: string;

  @ApiProperty({ description: 'Installment number' })
  @IsInt()
  installmentNumber!: number;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ description: 'Amount' })
  @IsString()
  amount!: string;

  @ApiProperty({ description: 'Payment method ID', required: false })
  @IsUUID()
  @IsOptional()
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Status',
    enum: InstallmentStatus,
    default: InstallmentStatus.UNPAID,
  })
  @IsEnum(InstallmentStatus)
  @IsOptional()
  status?: InstallmentStatus;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Collected by user ID', required: false })
  @IsUUID()
  @IsOptional()
  collectedByUserId?: string;
}
