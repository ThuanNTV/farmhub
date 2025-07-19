import { PartialType } from '@nestjs/swagger';
import { CreateReturnOrderItemDto } from 'src/modules/return-order-items/dto/create-returnOrderItem.dto';

export class UpdateReturnOrderItemDto extends PartialType(
  CreateReturnOrderItemDto,
) {}
