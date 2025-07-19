import { PartialType } from '@nestjs/swagger';
import { CreateInstallmentDto } from 'src/modules/installments/dto/create-installment.dto';

export class UpdateInstallmentDto extends PartialType(CreateInstallmentDto) {}
