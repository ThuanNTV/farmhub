import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsString,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export enum UserStoreMappingSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  USER_ID = 'user_id',
  STORE_ID = 'store_id',
  ROLE = 'role',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum UserRole {
  ADMIN_GLOBAL = 'ADMIN_GLOBAL',
  ADMIN_STORE = 'ADMIN_STORE',
  STORE_MANAGER = 'STORE_MANAGER',
  STORE_STAFF = 'STORE_STAFF',
  VIEWER = 'VIEWER',
}

export class UserStoreMappingFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by store ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Store ID must be a valid UUID' })
  storeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.STORE_MANAGER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by multiple roles',
    enum: UserRole,
    isArray: true,
    example: [UserRole.STORE_MANAGER, UserRole.STORE_STAFF],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Maximum 10 roles allowed' })
  @IsEnum(UserRole, {
    each: true,
    message: 'Each role must be a valid user role',
  })
  roles?: UserRole[];

  @ApiPropertyOptional({
    description: 'Filter by multiple user IDs',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: 'Maximum 50 user IDs allowed' })
  @IsUUID(4, { each: true, message: 'Each user ID must be a valid UUID' })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by multiple store IDs',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174003',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: 'Maximum 50 store IDs allowed' })
  @IsUUID(4, { each: true, message: 'Each store ID must be a valid UUID' })
  storeIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter by created date from (ISO string)',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date to (ISO string)',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search by user name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  userSearch?: string;

  @ApiPropertyOptional({
    description: 'Search by store name',
    example: 'main store',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  storeSearch?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: UserStoreMappingSortBy,
    example: UserStoreMappingSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserStoreMappingSortBy, { message: 'Sort by must be a valid field' })
  sortBy?: UserStoreMappingSortBy = UserStoreMappingSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Include deleted mappings',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeDeleted?: boolean = false;
}

export class PaginationMetaDto {
  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page!: number;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10 })
  limit!: number;

  @ApiPropertyOptional({ description: 'Total number of items', example: 100 })
  total!: number;

  @ApiPropertyOptional({ description: 'Total number of pages', example: 10 })
  totalPages!: number;

  @ApiPropertyOptional({ description: 'Has next page', example: true })
  hasNext!: boolean;

  @ApiPropertyOptional({ description: 'Has previous page', example: false })
  hasPrev!: boolean;
}

export class PaginatedUserStoreMappingResponseDto {
  @ApiPropertyOptional({
    description: 'Array of user store mappings',
    isArray: true,
  })
  data!: any[];

  @ApiPropertyOptional({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination!: PaginationMetaDto;

  @ApiPropertyOptional({
    description: 'Applied filters',
    type: UserStoreMappingFilterDto,
  })
  appliedFilters!: Partial<UserStoreMappingFilterDto>;

  @ApiPropertyOptional({
    description: 'Response generation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  generatedAt!: Date;
}

export class UserStoreMappingStatsDto {
  @ApiPropertyOptional({
    description: 'Total number of mappings',
    example: 150,
  })
  totalMappings!: number;

  @ApiPropertyOptional({
    description: 'Mappings by role',
    example: { STORE_MANAGER: 50, STORE_STAFF: 80, VIEWER: 20 },
  })
  mappingsByRole!: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Active mappings count',
    example: 140,
  })
  activeMappings!: number;

  @ApiPropertyOptional({
    description: 'Deleted mappings count',
    example: 10,
  })
  deletedMappings!: number;

  @ApiPropertyOptional({
    description: 'Top active stores',
    example: [
      { storeId: 'store-1', storeName: 'Main Store', userCount: 25 },
      { storeId: 'store-2', storeName: 'Branch Store', userCount: 20 },
    ],
  })
  topActiveStores!: Array<{
    storeId: string;
    storeName: string;
    userCount: number;
  }>;

  @ApiPropertyOptional({
    description: 'Recent activity',
    example: [
      {
        action: 'CREATE',
        userId: 'user-1',
        userName: 'John Doe',
        storeId: 'store-1',
        storeName: 'Main Store',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ],
  })
  recentActivity!: Array<{
    action: string;
    userId: string;
    userName: string;
    storeId: string;
    storeName: string;
    createdAt: Date;
  }>;

  @ApiPropertyOptional({
    description: 'Statistics generation timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  generatedAt!: Date;
}
