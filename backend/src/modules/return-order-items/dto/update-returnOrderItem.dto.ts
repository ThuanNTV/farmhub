import { PartialType } from '@nestjs/swagger';
import { CreateReturnOrderItemDto } from './create-returnOrderItem.dto';

export class UpdateReturnOrderItemDto extends PartialType(
  CreateReturnOrderItemDto,
) {}
