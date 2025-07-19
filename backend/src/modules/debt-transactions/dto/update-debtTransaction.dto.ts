import { PartialType } from '@nestjs/swagger';
import { CreateDebtTransactionDto } from 'src/modules/debt-transactions/dto/create-debtTransaction.dto';

export class UpdateDebtTransactionDto extends PartialType(
  CreateDebtTransactionDto,
) {}
