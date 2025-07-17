import { PartialType } from '@nestjs/swagger';
import { CreateStockTransferItemDto } from './create-stockTransferItem.dto';

export class UpdateStockTransferItemDto extends PartialType(
  CreateStockTransferItemDto,
) {}
