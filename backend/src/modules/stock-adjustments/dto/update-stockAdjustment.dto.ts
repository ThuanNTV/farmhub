import { PartialType } from '@nestjs/swagger';
import { CreateStockAdjustmentDto } from './create-stockAdjustment.dto';

export class UpdateStockAdjustmentDto extends PartialType(
  CreateStockAdjustmentDto,
) {}
