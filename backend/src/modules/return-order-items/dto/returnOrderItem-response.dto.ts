import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class ReturnOrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  returnOrderId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: string;

  @ApiProperty({ required: false })
  condition?: string;

  @ApiProperty()
  restocked!: boolean;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty({ required: false })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @Exclude()
  updatedByUserId?: string;

  @ApiProperty({ required: false })
  @Exclude()
  returnOrder?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @Exclude()
  product?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @Exclude()
  createdByUser?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @Exclude()
  updatedByUser?: Record<string, unknown>;
}
