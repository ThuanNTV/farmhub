import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class PreviewReportQueryDto {
  @ApiProperty({
    description: 'Loại báo cáo',
    enum: ['sales', 'inventory', 'customers', 'financial', 'products'],
    example: 'sales',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['sales', 'inventory', 'customers', 'financial', 'products'])
  type: string;

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

export class ReportDataRowDto {
  @ApiProperty({
    description: 'Dữ liệu hàng trong báo cáo (dynamic)',
    example: {
      date: '2024-01-15',
      revenue: 2500000,
      orders: 25,
      customers: 15
    },
  })
  [key: string]: any;
}

export class PreviewReportResponseDto {
  @ApiProperty({
    description: 'Loại báo cáo',
    example: 'sales',
  })
  reportType: string;

  @ApiProperty({
    description: 'Tiêu đề báo cáo',
    example: 'Báo cáo doanh số bán hàng',
  })
  title: string;

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
    description: 'Tổng số bản ghi',
    example: 31,
  })
  totalRecords: number;

  @ApiProperty({
    description: 'Tên các cột',
    example: ['Ngày', 'Doanh thu', 'Số đơn hàng', 'Số khách hàng'],
  })
  columns: string[];

  @ApiProperty({
    description: 'Dữ liệu báo cáo (preview 10 dòng đầu)',
    type: [ReportDataRowDto],
  })
  data: ReportDataRowDto[];

  @ApiProperty({
    description: 'Thống kê tổng hợp',
    example: {
      totalRevenue: 75000000,
      totalOrders: 750,
      totalCustomers: 250,
      averageOrderValue: 100000
    },
  })
  summary: any;
}
