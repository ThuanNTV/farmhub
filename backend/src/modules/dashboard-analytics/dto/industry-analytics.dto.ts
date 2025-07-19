import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class IndustryAnalyticsQueryDto {
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

export class IndustryDataDto {
  @ApiProperty({
    description: 'Tên ngành nghề',
    example: 'Nông nghiệp',
  })
  industry: string;

  @ApiProperty({
    description: 'Số lượng giao dịch',
    example: 150,
  })
  count: number;

  @ApiProperty({
    description: 'Giá trị giao dịch',
    example: 25000000,
  })
  value: number;
}

export class IndustryAnalyticsResponseDto {
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
    description: 'Dữ liệu phân tích theo ngành nghề',
    type: [IndustryDataDto],
  })
  industries: IndustryDataDto[];
}
