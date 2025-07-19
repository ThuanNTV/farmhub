import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { StockAdjustmentStatus } from 'src/entities/tenant/stock_adjustment.entity';

export class StockAdjustmentResponseDto {
  @ApiProperty({ description: 'Stock adjustment ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Product ID' })
  @Expose({ name: 'productId' })
  productId!: string;

  @ApiProperty({ description: 'Adjustment type' })
  @Expose({ name: 'adjustmentType' })
  adjustmentType!: string;

  @ApiProperty({ description: 'Quantity change' })
  @Expose({ name: 'quantityChange' })
  quantityChange!: number;

  @ApiProperty({ description: 'Reason for adjustment', required: false })
  @Expose()
  reason?: string;

  @ApiProperty({
    description: 'Status of adjustment',
    enum: StockAdjustmentStatus,
  })
  @Expose()
  status!: StockAdjustmentStatus;

  @ApiProperty({ description: 'User ID who made the adjustment' })
  @Expose({ name: 'adjustedByUserId' })
  adjustedByUserId!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;
}
