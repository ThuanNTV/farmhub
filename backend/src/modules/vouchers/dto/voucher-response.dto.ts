import { ApiProperty } from '@nestjs/swagger';

export class VoucherResponseDto {
  @ApiProperty({ description: 'Voucher ID' })
  id!: number;

  @ApiProperty({ description: 'Voucher code' })
  code!: string;

  @ApiProperty({ description: 'Discount value', required: false })
  discountValue?: number;

  @ApiProperty({ description: 'Start date', required: false })
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  endDate?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt!: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt!: string;
}
