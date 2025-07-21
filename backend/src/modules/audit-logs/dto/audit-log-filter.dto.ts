import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AuditLogSortBy {
  CREATED_AT = 'created_at',
  ACTION = 'action',
  USER_ID = 'user_id',
  TARGET_TABLE = 'target_table',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class AuditLogFilterDto {
  @ApiProperty({ description: 'ID người dùng', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Hành động',
    required: false,
    example: 'CREATE_PRODUCT',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Bảng/Resource',
    required: false,
    example: 'products',
  })
  @IsOptional()
  @IsString()
  targetTable?: string;

  @ApiProperty({ description: 'ID bản ghi', required: false })
  @IsOptional()
  @IsUUID()
  targetId?: string;

  @ApiProperty({ description: 'Địa chỉ IP', required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'Thiết bị', required: false })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({ description: 'Trình duyệt', required: false })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiProperty({ description: 'Tên người dùng', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    description: 'Ngày bắt đầu',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Danh sách hành động',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];

  @ApiProperty({
    description: 'Danh sách bảng',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTables?: string[];

  @ApiProperty({
    description: 'Sắp xếp theo',
    enum: AuditLogSortBy,
    required: false,
    default: AuditLogSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(AuditLogSortBy)
  sortBy?: AuditLogSortBy = AuditLogSortBy.CREATED_AT;

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Trang hiện tại',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class DateRangeDto {
  @ApiProperty({ description: 'Ngày bắt đầu', example: '2024-01-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  endDate!: string;
}

export class AuditLogStatsDto {
  @ApiProperty({ description: 'Tổng số logs', example: 1250 })
  totalLogs!: number;

  @ApiProperty({
    description: 'Logs theo hành động',
    type: Object,
    example: { CREATE_PRODUCT: 450, UPDATE_PRODUCT: 300 },
  })
  logsByAction!: Record<string, number>;

  @ApiProperty({
    description: 'Logs theo bảng',
    type: Object,
    example: { products: 750, orders: 500 },
  })
  logsByTable!: Record<string, number>;

  @ApiProperty({
    description: 'Logs theo người dùng',
    type: Object,
    example: { 'user-123': 200, 'user-456': 150 },
  })
  logsByUser!: Record<string, number>;

  @ApiProperty({
    description: 'Logs theo thiết bị',
    type: Object,
    example: { Desktop: 800, Mobile: 450 },
  })
  logsByDevice!: Record<string, number>;

  @ApiProperty({
    description: 'Logs theo trình duyệt',
    type: Object,
    example: { Chrome: 600, Firefox: 300 },
  })
  logsByBrowser!: Record<string, number>;

  @ApiProperty({ description: 'Hoạt động gần đây', type: [Object] })
  recentActivity!: Array<{
    action: string;
    targetTable: string;
    userName: string;
    createdAt: Date;
    count: number;
  }>;

  @ApiProperty({ description: 'Thống kê theo ngày', type: [Object] })
  dailyStats!: Array<{
    date: string;
    count: number;
  }>;

  @ApiProperty({ description: 'Top người dùng hoạt động', type: [Object] })
  topActiveUsers!: Array<{
    userId: string;
    userName: string;
    actionCount: number;
    lastActivity: Date;
  }>;

  @ApiProperty({
    description: 'Thời gian tạo báo cáo',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt!: Date;
}

export class PaginatedAuditLogResponseDto {
  @ApiProperty({ description: 'Danh sách audit logs', type: [Object] })
  data!: any[];

  @ApiProperty({ description: 'Thông tin phân trang' })
  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty({ description: 'Thông tin filter đã áp dụng' })
  appliedFilters!: {
    userId?: string;
    action?: string;
    targetTable?: string;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    search?: string;
  };

  @ApiProperty({
    description: 'Thời gian tạo kết quả',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt!: Date;
}

export class AuditLogExportDto {
  @ApiProperty({
    description: 'Định dạng export',
    enum: ['csv', 'excel', 'json'],
    default: 'csv',
  })
  @IsOptional()
  @IsEnum(['csv', 'excel', 'json'])
  format?: 'csv' | 'excel' | 'json' = 'csv';

  @ApiProperty({ description: 'Bao gồm metadata', default: true })
  @IsOptional()
  includeMetadata?: boolean = true;

  @ApiProperty({ description: 'Bao gồm chi tiết', default: false })
  @IsOptional()
  includeDetails?: boolean = false;

  @ApiProperty({
    description: 'Tên file (không bao gồm extension)',
    required: false,
  })
  @IsOptional()
  @IsString()
  filename?: string;
}
