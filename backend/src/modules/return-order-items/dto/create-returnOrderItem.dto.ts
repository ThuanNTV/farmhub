import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReturnOrderItemDto {
  @ApiProperty()
  @IsUUID()
  returnOrderId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty()
  @IsInt()
  quantity!: number;

  @ApiProperty()
  @IsNumberString()
  unitPrice!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  condition?: string;
}
