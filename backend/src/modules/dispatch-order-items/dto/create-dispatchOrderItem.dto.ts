import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsNumberString } from 'class-validator';

export class CreateDispatchOrderItemDto {
  @ApiProperty()
  @IsUUID()
  dispatchOrderId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty()
  @IsInt()
  quantity!: number;

  @ApiProperty()
  @IsNumberString()
  unitPrice!: string;
}
