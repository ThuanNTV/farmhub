import { PartialType } from '@nestjs/swagger';
import { CreateStockAdjustmentDto } from 'src/modules/stock-adjustments/dto/create-stockAdjustment.dto';

export class UpdateStockAdjustmentDto extends PartialType(
  CreateStockAdjustmentDto,
) {}
