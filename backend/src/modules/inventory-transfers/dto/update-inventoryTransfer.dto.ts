import { PartialType } from '@nestjs/swagger';
import { CreateInventoryTransferDto } from './create-inventoryTransfer.dto';

export class UpdateInventoryTransferDto extends PartialType(
  CreateInventoryTransferDto,
) {}
