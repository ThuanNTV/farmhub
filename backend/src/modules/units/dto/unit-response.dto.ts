import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UnitResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  @ApiProperty()
  isDeleted!: boolean;

  @Exclude()
  createdByUserId!: string;

  @Exclude()
  updatedByUserId?: string;
}
