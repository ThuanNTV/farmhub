import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class PromotionResponseDto {
  @ApiProperty({ description: 'Promotion ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Promotion name' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'Promotion type' })
  @Expose()
  type!: string;

  @ApiProperty({ description: 'Promotion value' })
  @Expose()
  value!: string;

  @ApiProperty({ description: 'Applies to' })
  @Expose({ name: 'appliesTo' })
  appliesTo!: string;

  @ApiProperty({ description: 'Start date' })
  @Expose({ name: 'startDate' })
  startDate!: Date;

  @ApiProperty({ description: 'End date' })
  @Expose({ name: 'endDate' })
  endDate!: Date;

  @ApiProperty({ description: 'Is active' })
  @Expose({ name: 'isActive' })
  isActive!: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Created by user ID' })
  @Exclude()
  createdByUserId!: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @Exclude()
  updatedByUserId?: string;
}
