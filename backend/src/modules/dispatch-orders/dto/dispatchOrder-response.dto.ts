import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DispatchOrderStatus } from '../../../entities/tenant/dispatch_order.entity';

export class DispatchOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  dispatchCode!: string;

  @ApiProperty({ required: false })
  purpose?: string;

  @ApiProperty({ enum: DispatchOrderStatus })
  status!: DispatchOrderStatus;

  @ApiProperty()
  @Exclude()
  createdByUserId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
