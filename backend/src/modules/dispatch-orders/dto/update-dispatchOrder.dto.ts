import { PartialType } from '@nestjs/swagger';
import { CreateDispatchOrderDto } from './create-dispatchOrder.dto';

export class UpdateDispatchOrderDto extends PartialType(
  CreateDispatchOrderDto,
) {}
