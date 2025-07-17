import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLoyaltyPointLogDto {
  @ApiProperty({ description: 'ID của khách hàng liên quan đến điểm thưởng' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({
    required: false,
    description: 'ID đơn hàng nếu điểm phát sinh từ giao dịch',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'Số điểm thay đổi (có thể âm hoặc dương)' })
  @IsInt()
  change!: number;

  @ApiProperty({ required: false, description: 'Lý do thay đổi điểm' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, description: 'ID người tạo (nếu có)' })
  @IsOptional()
  @IsUUID()
  createdByUserId?: string;

  @ApiProperty({
    required: false,
    description: 'ID người chỉnh sửa gần nhất (nếu có)',
  })
  @IsOptional()
  @IsUUID()
  updatedByUserId?: string;
}
