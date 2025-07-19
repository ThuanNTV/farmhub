import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class ExportReportQueryDto {
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

export class ExportReportResponseDto {
  @ApiProperty({
    description: 'Trạng thái xuất báo cáo',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Báo cáo đã được xuất thành công',
  })
  message: string;

  @ApiProperty({
    description: 'Loại báo cáo',
    example: 'sales',
  })
  reportType: string;

  @ApiProperty({
    description: 'Định dạng file',
    example: 'xlsx',
  })
  format: string;

  @ApiProperty({
    description: 'URL file báo cáo',
    example: 'https://example.com/reports/sales-report-2024-01.xlsx',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Tên file',
    example: 'sales-report-2024-01.xlsx',
  })
  fileName: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Ngày tạo báo cáo',
    example: '2024-02-01T10:30:00Z',
  })
  createdAt: string;
}
