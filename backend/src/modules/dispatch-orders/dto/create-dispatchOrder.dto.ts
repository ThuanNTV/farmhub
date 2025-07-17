import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { DispatchOrderStatus } from '../../../entities/tenant/dispatch_order.entity';

export class CreateDispatchOrderDto {
  @ApiProperty()
  @IsString()
  dispatchCode!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({
    enum: DispatchOrderStatus,
    default: DispatchOrderStatus.PENDING,
  })
  @IsEnum(DispatchOrderStatus)
  status!: DispatchOrderStatus;

  @ApiProperty()
  @IsUUID()
  createdByUserId!: string;
}
