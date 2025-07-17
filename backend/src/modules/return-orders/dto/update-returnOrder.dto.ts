import { PartialType } from '@nestjs/swagger';
import { CreateReturnOrderDto } from './create-returnOrder.dto';

export class UpdateReturnOrderDto extends PartialType(CreateReturnOrderDto) {}
