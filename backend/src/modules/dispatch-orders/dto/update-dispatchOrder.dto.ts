import { PartialType } from '@nestjs/swagger';
import { CreateDispatchOrderDto } from 'src/modules/dispatch-orders/dto/create-dispatchOrder.dto';

export class UpdateDispatchOrderDto extends PartialType(
  CreateDispatchOrderDto,
) {}
