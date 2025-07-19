import { ApiProperty } from '@nestjs/swagger';

export class OrdersByStatusDto {
  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    example: 'completed',
  })
  status: string;

  @ApiProperty({
    description: 'Số lượng đơn hàng',
    example: 125,
  })
  count: number;
}

export class DashboardOrdersResponseDto {
  @ApiProperty({
    description: 'Tổng số đơn hàng',
    example: 245,
  })
  total: number;

  @ApiProperty({
    description: 'Đơn hàng theo trạng thái',
    type: [OrdersByStatusDto],
  })
  byStatus: OrdersByStatusDto[];
}
