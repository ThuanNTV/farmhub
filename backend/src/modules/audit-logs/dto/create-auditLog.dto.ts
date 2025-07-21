import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsObject, IsIP } from 'class-validator';
import { AuditMetadata } from 'src/common/types/common.types';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'ID người dùng thực hiện hành động' })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: 'Hành động được thực hiện',
    example: 'CREATE_PRODUCT',
  })
  @IsString()
  action!: string;

  @ApiProperty({
    description: 'Bảng/Resource bị tác động',
    example: 'products',
  })
  @IsString()
  targetTable!: string;

  @ApiProperty({ description: 'ID của record bị tác động' })
  @IsUUID()
  targetId!: string;

  @ApiProperty({ description: 'ID store/tenant' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({
    description: 'Địa chỉ IP của người dùng',
    required: false,
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User Agent của browser', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Session ID', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'Thiết bị sử dụng',
    required: false,
    example: 'Desktop',
  })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({
    description: 'Trình duyệt sử dụng',
    required: false,
    example: 'Chrome',
  })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiProperty({
    description: 'Hệ điều hành',
    required: false,
    example: 'Windows 10',
  })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiProperty({ description: 'Tên người dùng', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    description: 'Giá trị cũ trước khi thay đổi',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  oldValue?: Record<string, any>;

  @ApiProperty({
    description: 'Giá trị mới sau khi thay đổi',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  newValue?: Record<string, any>;

  @ApiProperty({
    description: 'Metadata bổ sung',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: AuditMetadata;

  @ApiProperty({ description: 'Chi tiết bổ sung', required: false })
  @IsOptional()
  @IsString()
  details?: string;
}
