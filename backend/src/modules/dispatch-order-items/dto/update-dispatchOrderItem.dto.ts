import { PartialType } from '@nestjs/swagger';
import { CreateDispatchOrderItemDto } from './create-dispatchOrderItem.dto';

export class UpdateDispatchOrderItemDto extends PartialType(
  CreateDispatchOrderItemDto,
) {}
