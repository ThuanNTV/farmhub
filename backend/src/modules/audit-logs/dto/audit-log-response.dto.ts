import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuditMetadata } from 'src/common/types/common.types';

export class AuditLogResponseDto {
  @ApiProperty({ description: 'ID log' })
  @Expose({ name: 'id' })
  id!: string;

  @ApiProperty({ description: 'ID người dùng' })
  @Expose({ name: 'userId' })
  userId!: string;

  @ApiProperty({ description: 'Hành động' })
  @Expose({ name: 'action' })
  action!: string;

  @ApiProperty({ description: 'Bảng tác động' })
  @Expose({ name: 'targetTable' })
  targetTable!: string;

  @ApiProperty({ description: 'ID bản ghi tác động' })
  @Expose({ name: 'targetId' })
  targetId!: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @Expose({ name: 'metadata' })
  metadata?: AuditMetadata;

  @ApiProperty({
    description: 'Thời gian tạo',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật',
    type: String,
    format: 'date-time',
  })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Đã xóa mềm' })
  @Expose({ name: 'isDeleted' })
  isDeleted!: boolean;

  @ApiProperty({
    description: 'Thời gian xóa',
    type: String,
    format: 'date-time',
    required: false,
  })
  @Expose({ name: 'deletedAt' })
  deletedAt?: Date;
}
