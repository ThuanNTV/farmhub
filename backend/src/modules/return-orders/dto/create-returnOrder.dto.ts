import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ReturnOrderStatus } from 'src/entities/tenant/return_order.entity';

export class CreateReturnOrderDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty()
  @IsDateString()
  returnDate!: Date;

  @ApiProperty({ enum: ReturnOrderStatus })
  @IsEnum(ReturnOrderStatus)
  status!: ReturnOrderStatus;
}
