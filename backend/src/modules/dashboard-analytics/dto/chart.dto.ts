import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsIn } from 'class-validator';

export class ChartQueryDto {
  @ApiProperty({
    description: 'Loại biểu đồ',
    enum: ['sales_by_category', 'sales_by_payment_method', 'daily_sales'],
    example: 'sales_by_category',
  })
  @IsNotEmpty()
  @IsIn(['sales_by_category', 'sales_by_payment_method', 'daily_sales'])
  type: 'sales_by_category' | 'sales_by_payment_method' | 'daily_sales';

  @ApiProperty({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  from: string;

  @ApiProperty({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  to: string;
}

export class ChartDataPointDto {
  @ApiProperty({
    description: 'Nhãn (tên danh mục, phương thức thanh toán, ngày)',
    example: 'Thực phẩm',
  })
  label: string;

  @ApiProperty({
    description: 'Giá trị (doanh số, số lượng)',
    example: 5000000,
  })
  value: number;
}

export class ChartResponseDto {
  @ApiProperty({
    description: 'Loại biểu đồ',
    enum: ['sales_by_category', 'sales_by_payment_method', 'daily_sales'],
    example: 'sales_by_category',
  })
  type: 'sales_by_category' | 'sales_by_payment_method' | 'daily_sales';

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01',
  })
  from: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-01-31',
  })
  to: string;

  @ApiProperty({
    description: 'Dữ liệu biểu đồ',
    type: [ChartDataPointDto],
  })
  chart: ChartDataPointDto[];
}
