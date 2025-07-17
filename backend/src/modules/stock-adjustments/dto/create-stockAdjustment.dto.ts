import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockAdjustmentStatus } from '../../../entities/tenant/stock_adjustment.entity';

export class CreateStockAdjustmentDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Adjustment type (increase, decrease)' })
  @IsString()
  adjustmentType!: string;

  @ApiProperty({ description: 'Quantity change' })
  @IsNumber()
  quantityChange!: number;

  @ApiProperty({ description: 'Reason for adjustment', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    description: 'Status of adjustment',
    enum: StockAdjustmentStatus,
    default: StockAdjustmentStatus.PENDING,
  })
  @IsEnum(StockAdjustmentStatus)
  @IsOptional()
  status?: StockAdjustmentStatus;

  @ApiProperty({ description: 'User ID who made the adjustment' })
  @IsUUID()
  adjustedByUserId!: string;
}
