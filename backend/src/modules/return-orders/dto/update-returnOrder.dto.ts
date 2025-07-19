import { PartialType } from '@nestjs/swagger';
import { CreateReturnOrderDto } from 'src/modules/return-orders/dto/create-returnOrder.dto';

export class UpdateReturnOrderDto extends PartialType(CreateReturnOrderDto) {}
