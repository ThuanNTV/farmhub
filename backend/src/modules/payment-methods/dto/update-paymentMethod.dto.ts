import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './create-paymentMethod.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
