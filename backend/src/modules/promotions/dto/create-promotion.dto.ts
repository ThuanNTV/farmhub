import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Promotion type (percentage, fixed, bogo)' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Promotion value' })
  @IsString()
  value!: string;

  @ApiProperty({ description: 'Applies to (all, category, product)' })
  @IsString()
  appliesTo!: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: 'Is active', default: true })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdByUserId!: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @IsUUID()
  @IsOptional()
  updatedByUserId?: string;
}
