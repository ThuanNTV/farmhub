import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class HeatmapQueryDto {
  @ApiProperty({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  from!: string;

  @ApiProperty({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsNotEmpty()
  @IsDateString()
  to!: string;
}

export class HeatmapDataPointDto {
  @ApiProperty({
    description: 'Tọa độ X (giờ trong ngày)',
    example: 14,
  })
  x!: number;

  @ApiProperty({
    description: 'Tọa độ Y (ngày trong tuần)',
    example: 2,
  })
  y!: number;

  @ApiProperty({
    description: 'Giá trị (số lượng giao dịch)',
    example: 25,
  })
  value!: number;
}

export class HeatmapResponseDto {
  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01',
  })
  from!: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-01-31',
  })
  to!: string;

  @ApiProperty({
    description: 'Dữ liệu heatmap',
    type: [HeatmapDataPointDto],
  })
  heatmap!: HeatmapDataPointDto[];
}
