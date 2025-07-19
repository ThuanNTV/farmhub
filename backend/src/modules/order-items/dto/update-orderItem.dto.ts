import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-orderItem.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
