import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class LoyaltyPointLogResponseDto {
  @ApiProperty({ description: 'ID của bản ghi log điểm thưởng' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'ID của khách hàng nhận hoặc bị trừ điểm' })
  @Expose()
  customerId!: string;

  @ApiProperty({
    required: false,
    description: 'ID đơn hàng liên quan đến điểm thưởng (nếu có)',
  })
  @Expose()
  orderId?: string;

  @ApiProperty({ description: 'Số điểm thay đổi (có thể là cộng hoặc trừ)' })
  @Expose()
  change!: number;

  @ApiProperty({ required: false, description: 'Lý do thay đổi điểm thưởng' })
  @Expose()
  reason?: string;

  @ApiProperty({ description: 'Thời điểm tạo bản ghi' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    required: false,
    description: 'ID người tạo bản ghi (nếu có)',
  })
  @Exclude()
  createdByUserId?: string;

  @ApiProperty({
    required: false,
    description: 'ID người cập nhật gần nhất (nếu có)',
  })
  @Exclude()
  updatedByUserId?: string;
}
