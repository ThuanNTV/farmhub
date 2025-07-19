import { ApiProperty } from '@nestjs/swagger';

export class RevenueByDayDto {
  @ApiProperty({
    description: 'Ngày (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  date!: string;

  @ApiProperty({
    description: 'Doanh thu trong ngày',
    example: 2500000,
  })
  revenue!: number;
}

export class DashboardRevenueResponseDto {
  @ApiProperty({
    description: 'Tổng doanh thu',
    example: 15000000,
  })
  total!: number;

  @ApiProperty({
    description: 'Doanh thu theo từng ngày',
    type: [RevenueByDayDto],
  })
  byDay!: RevenueByDayDto[];
}
