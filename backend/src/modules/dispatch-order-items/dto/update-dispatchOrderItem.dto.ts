import { PartialType } from '@nestjs/swagger';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatchOrderItem.dto';

export class UpdateDispatchOrderItemDto extends PartialType(
  CreateDispatchOrderItemDto,
) {}
