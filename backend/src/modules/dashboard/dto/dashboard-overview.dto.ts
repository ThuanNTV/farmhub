import { ApiProperty } from '@nestjs/swagger';

export class BestSellingProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Gạo ST25',
  })
  name: string;

  @ApiProperty({
    description: 'Số lượng bán được',
    example: 150,
  })
  quantity: number;
}

export class DashboardOverviewResponseDto {
  @ApiProperty({
    description: 'Tổng doanh thu',
    example: 15000000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Tổng số đơn hàng',
    example: 245,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Tổng số khách hàng',
    example: 89,
  })
  totalCustomers: number;

  @ApiProperty({
    description: 'Danh sách sản phẩm bán chạy',
    type: [BestSellingProductDto],
  })
  bestSellingProducts: BestSellingProductDto[];
}
