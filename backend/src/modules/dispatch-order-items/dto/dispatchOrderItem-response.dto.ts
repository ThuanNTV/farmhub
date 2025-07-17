import { ApiProperty } from '@nestjs/swagger';

export class DispatchOrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  dispatchOrderId!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
