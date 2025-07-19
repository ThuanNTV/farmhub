import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateStockTransferItemDto {
  @ApiProperty({ description: 'Stock transfer ID' })
  @IsUUID()
  stockTransferId?: string;

  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Quantity to transfer' })
  @IsNumber()
  quantity?: number;

  @ApiProperty({ description: 'Unit price', required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ description: 'Total price', required: false })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({ description: 'Notes about this item', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
