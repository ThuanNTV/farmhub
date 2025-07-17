import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class PaymentMethodResponseDto {
  @ApiProperty({ description: 'Payment method ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Payment method name' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Deleted at', required: false })
  @Expose({ name: 'deletedAt' })
  deletedAt?: Date;

  @ApiProperty({ description: 'Is deleted' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @Exclude()
  createdByUserId!: string;

  @Exclude()
  updatedByUserId?: string;
}
