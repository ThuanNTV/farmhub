import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-orderItem.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
