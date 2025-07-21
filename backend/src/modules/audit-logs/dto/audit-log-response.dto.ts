import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuditMetadata } from 'src/common/types/common.types';

export class AuditLogResponseDto {
  @ApiProperty({ description: 'ID log' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Expose()
  userId!: string;

  @ApiProperty({ description: 'Hành động' })
  @Expose()
  action!: string;

  @ApiProperty({ description: 'Bảng tác động' })
  @Expose()
  targetTable!: string;

  @ApiProperty({ description: 'ID bản ghi tác động' })
  @Expose()
  targetId!: string;

  @ApiProperty({ description: 'ID store/tenant' })
  @Expose()
  storeId!: string;

  @ApiProperty({ description: 'Địa chỉ IP', required: false })
  @Expose()
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent', required: false })
  @Expose()
  userAgent?: string;

  @ApiProperty({ description: 'Session ID', required: false })
  @Expose()
  sessionId?: string;

  @ApiProperty({ description: 'Thiết bị', required: false })
  @Expose()
  device?: string;

  @ApiProperty({ description: 'Trình duyệt', required: false })
  @Expose()
  browser?: string;

  @ApiProperty({ description: 'Hệ điều hành', required: false })
  @Expose()
  os?: string;

  @ApiProperty({ description: 'Tên người dùng', required: false })
  @Expose()
  userName?: string;

  @ApiProperty({ description: 'Giá trị cũ', required: false, type: Object })
  @Expose()
  oldValue?: Record<string, any>;

  @ApiProperty({ description: 'Giá trị mới', required: false, type: Object })
  @Expose()
  newValue?: Record<string, any>;

  @ApiProperty({ description: 'Metadata', required: false })
  @Expose()
  metadata?: AuditMetadata;

  @ApiProperty({ description: 'Chi tiết', required: false })
  @Expose()
  details?: string;

  @ApiProperty({
    description: 'Thời gian tạo',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    type: String,
    format: 'date-time',
  })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose()
  isDeleted!: boolean;

  @ApiProperty({
    description: 'Thời gian xóa',
    type: String,
    format: 'date-time',
    required: false,
  })
  @Expose()
  deletedAt?: Date;
}
