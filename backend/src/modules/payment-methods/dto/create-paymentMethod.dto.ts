import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method ID' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Payment method name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdByUserId!: string;
}
