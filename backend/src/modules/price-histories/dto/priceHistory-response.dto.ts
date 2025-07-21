import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class PriceHistoryResponseDto {
  @ApiProperty({ description: 'ID', example: 'uuid-123' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'ID sản phẩm', example: 'prod-001' })
  @Expose()
  productId!: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Phân bón NPK' })
  @Expose()
  productName?: string;

  @ApiProperty({
    description: 'Loại giá',
    enum: ['retail', 'wholesale', 'credit', 'cost'],
    example: 'retail',
  })
  @Expose()
  priceType!: 'retail' | 'wholesale' | 'credit' | 'cost';

  @ApiProperty({ description: 'Giá cũ', example: 100000 })
  @Expose()
  oldPrice!: number;

  @ApiProperty({ description: 'Giá mới', example: 120000 })
  @Expose()
  newPrice!: number;

  @ApiProperty({ description: 'Chênh lệch giá', example: 20000 })
  @Expose()
  priceDifference!: number;

  @ApiProperty({ description: 'Phần trăm thay đổi', example: 20.0 })
  @Expose()
  percentageChange!: number;

  @ApiProperty({
    description: 'Lý do thay đổi',
    example: 'Điều chỉnh giá theo thị trường',
  })
  @Expose()
  reason?: string;

  @ApiProperty({ description: 'Metadata bổ sung' })
  @Expose()
  metadata?: any;

  @ApiProperty({ required: false })
  @Exclude()
  changedByUserId?: string;

  @ApiProperty({
    description: 'Ngày thay đổi',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  changedAt!: Date;

  @ApiProperty({ description: 'Có tăng giá không', example: true })
  @Expose()
  isIncrease!: boolean;

  @ApiProperty({ description: 'Có giảm giá không', example: false })
  @Expose()
  isDecrease!: boolean;

  @ApiProperty({ description: 'Thay đổi tuyệt đối', example: 20000 })
  @Expose()
  absoluteChange!: number;

  @ApiProperty({
    description: 'Phần trăm thay đổi định dạng',
    example: '+20.00%',
  })
  @Expose()
  formattedPercentageChange!: string;

  @ApiProperty({ required: false })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @Exclude()
  updatedByUserId?: string;
}
