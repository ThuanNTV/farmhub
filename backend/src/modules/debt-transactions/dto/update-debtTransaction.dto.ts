import { PartialType } from '@nestjs/swagger';
import { CreateDebtTransactionDto } from './create-debtTransaction.dto';

export class UpdateDebtTransactionDto extends PartialType(
  CreateDebtTransactionDto,
) {}
