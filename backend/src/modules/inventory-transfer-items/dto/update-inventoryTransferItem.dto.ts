import { PartialType } from '@nestjs/swagger';
import { CreateInventoryTransferItemDto } from './create-inventoryTransferItem.dto';

export class UpdateInventoryTransferItemDto extends PartialType(
  CreateInventoryTransferItemDto,
) {}
