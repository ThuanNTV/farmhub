import { PartialType } from '@nestjs/swagger';
import { CreateInventoryTransferDto } from 'src/modules/inventory-transfers/dto/create-inventoryTransfer.dto';

export class UpdateInventoryTransferDto extends PartialType(
  CreateInventoryTransferDto,
) {}
