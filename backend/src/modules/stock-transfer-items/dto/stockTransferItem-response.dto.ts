import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class StockTransferItemResponseDto {
  @ApiProperty({ description: 'Item ID' })
  id?: string;

  @ApiProperty({ description: 'Stock transfer ID' })
  stockTransferId?: string;

  @ApiProperty({ description: 'Product ID' })
  productId?: string;

  @ApiProperty({ description: 'Quantity transferred' })
  quantity?: number;

  @ApiProperty({ description: 'Unit price', required: false })
  unitPrice?: number;

  @ApiProperty({ description: 'Notes about this item', required: false })
  notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt?: Date;

  @Exclude()
  createdByUserId?: string;

  @Exclude()
  updatedByUserId?: string;

  @Exclude()
  isDeleted?: boolean;
}
