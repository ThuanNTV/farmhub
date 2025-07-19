import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-paymentMethod.dto';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
