import { ApiProperty } from '@nestjs/swagger';

export class ReportTypeDto {
  @ApiProperty({
    description: 'Mã loại báo cáo',
    example: 'sales',
  })
  code: string;

  @ApiProperty({
    description: 'Tên loại báo cáo',
    example: 'Báo cáo doanh số',
  })
  name: string;

  @ApiProperty({
    description: 'Mô tả báo cáo',
    example: 'Báo cáo chi tiết về doanh số bán hàng theo thời gian',
  })
  description: string;

  @ApiProperty({
    description: 'Các định dạng hỗ trợ',
    example: ['xlsx', 'pdf', 'csv'],
  })
  supportedFormats: string[];

  @ApiProperty({
    description: 'Các trường dữ liệu có sẵn',
    example: ['date', 'revenue', 'orders', 'customers'],
  })
  availableFields: string[];

  @ApiProperty({
    description: 'Có hỗ trợ lọc theo ngày không',
    example: true,
  })
  supportsDateFilter: boolean;

  @ApiProperty({
    description: 'Có hỗ trợ xuất file không',
    example: true,
  })
  supportsExport: boolean;
}

export class ReportTypesResponseDto {
  @ApiProperty({
    description: 'Danh sách các loại báo cáo hỗ trợ',
    type: [ReportTypeDto],
  })
  reportTypes: ReportTypeDto[];

  @ApiProperty({
    description: 'Tổng số loại báo cáo',
    example: 5,
  })
  total: number;
}
