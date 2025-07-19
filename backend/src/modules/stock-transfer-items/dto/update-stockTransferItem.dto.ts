import { PartialType } from '@nestjs/swagger';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stockTransferItem.dto';

export class UpdateStockTransferItemDto extends PartialType(
  CreateStockTransferItemDto,
) {}
