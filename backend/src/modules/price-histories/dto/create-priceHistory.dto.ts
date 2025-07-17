import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class CreatePriceHistoryDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty()
  @IsNumber()
  oldPrice!: number;

  @ApiProperty()
  @IsNumber()
  newPrice!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  changedByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
