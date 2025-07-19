import { PartialType } from '@nestjs/swagger';
import { CreateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/create-inventoryTransferItem.dto';

export class UpdateInventoryTransferItemDto extends PartialType(
  CreateInventoryTransferItemDto,
) {}
