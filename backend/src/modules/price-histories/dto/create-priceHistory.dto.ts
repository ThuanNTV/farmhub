import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';

export class CreatePriceHistoryDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Loại giá',
    enum: ['retail', 'wholesale', 'credit', 'cost'],
    example: 'retail',
    default: 'retail',
  })
  @IsOptional()
  @IsEnum(['retail', 'wholesale', 'credit', 'cost'])
  priceType?: 'retail' | 'wholesale' | 'credit' | 'cost' = 'retail';

  @ApiProperty({ description: 'Giá cũ', example: 100000 })
  @IsNumber()
  @Min(0)
  oldPrice!: number;

  @ApiProperty({ description: 'Giá mới', example: 120000 })
  @IsNumber()
  @Min(0)
  newPrice!: number;

  @ApiProperty({
    description: 'Lý do thay đổi',
    required: false,
    example: 'Điều chỉnh giá theo thị trường',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Metadata bổ sung', required: false })
  @IsOptional()
  metadata?: {
    source?: string;
    batch_id?: string;
    supplier_price_change?: boolean;
    market_adjustment?: boolean;
    promotion?: boolean;
    cost_increase?: boolean;
    [key: string]: any;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  changedByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
