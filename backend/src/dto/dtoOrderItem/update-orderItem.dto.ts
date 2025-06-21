import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderItemDto } from './create-orderItem.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
