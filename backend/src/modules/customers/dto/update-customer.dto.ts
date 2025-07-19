import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from 'src/modules/customers/dto/create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
