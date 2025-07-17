import { ApiProperty } from '@nestjs/swagger';
import { ReturnOrderStatus } from '../../../entities/tenant/return_order.entity';

export class ReturnOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  returnDate!: Date;

  @ApiProperty({ enum: ReturnOrderStatus })
  status!: ReturnOrderStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
