import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class PriceHistoryResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  productId!: string;

  @ApiProperty()
  @Expose()
  oldPrice!: number;

  @ApiProperty()
  @Expose()
  newPrice!: number;

  @ApiProperty({ required: false })
  @Exclude()
  changedByUserId?: string;

  @ApiProperty()
  @Expose()
  changedAt!: Date;

  @ApiProperty({ required: false })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @Exclude()
  updatedByUserId?: string;
}
