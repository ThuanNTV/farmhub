import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserRole } from './user-store-mapping-filter.dto';

export class BulkCreateMappingItemDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId!: string;

  @ApiProperty({
    description: 'Store ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4, { message: 'Store ID must be a valid UUID' })
  storeId!: string;

  @ApiProperty({
    description: 'User role in the store',
    enum: UserRole,
    example: UserRole.STORE_STAFF,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role!: UserRole;

  @ApiPropertyOptional({
    description: 'Additional notes for the mapping',
    example: 'Temporary assignment for holiday season',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}

export class BulkCreateUserStoreMappingDto {
  @ApiProperty({
    description: 'Array of mappings to create',
    type: [BulkCreateMappingItemDto],
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
        notes: 'New employee assignment',
      },
      {
        userId: '123e4567-e89b-12d3-a456-426614174002',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_STAFF',
        notes: 'Transfer from another store',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one mapping is required' })
  @ArrayMaxSize(50, {
    message: 'Maximum 50 mappings allowed per bulk operation',
  })
  @ValidateNested({ each: true })
  @Type(() => BulkCreateMappingItemDto)
  mappings!: BulkCreateMappingItemDto[];

  @ApiPropertyOptional({
    description: 'Skip validation for existing mappings',
    example: false,
  })
  @IsOptional()
  skipExistingValidation?: boolean = false;
}

export class BulkUpdateMappingItemDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId!: string;

  @ApiProperty({
    description: 'Store ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4, { message: 'Store ID must be a valid UUID' })
  storeId!: string;

  @ApiPropertyOptional({
    description: 'New user role in the store',
    enum: UserRole,
    example: UserRole.STORE_MANAGER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Updated notes for the mapping',
    example: 'Promoted to manager position',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes must not exceed 500 characters' })
  notes?: string;
}

export class BulkUpdateUserStoreMappingDto {
  @ApiProperty({
    description: 'Array of mappings to update',
    type: [BulkUpdateMappingItemDto],
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        role: 'STORE_MANAGER',
        notes: 'Promoted to manager',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one mapping is required' })
  @ArrayMaxSize(50, {
    message: 'Maximum 50 mappings allowed per bulk operation',
  })
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateMappingItemDto)
  mappings!: BulkUpdateMappingItemDto[];
}

export class BulkDeleteMappingItemDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId!: string;

  @ApiProperty({
    description: 'Store ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(4, { message: 'Store ID must be a valid UUID' })
  storeId!: string;
}

export class BulkDeleteUserStoreMappingDto {
  @ApiProperty({
    description: 'Array of mapping identifiers to delete',
    type: [BulkDeleteMappingItemDto],
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
      },
      {
        userId: '123e4567-e89b-12d3-a456-426614174002',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one mapping is required' })
  @ArrayMaxSize(50, {
    message: 'Maximum 50 mappings allowed per bulk operation',
  })
  @ValidateNested({ each: true })
  @Type(() => BulkDeleteMappingItemDto)
  mappings!: BulkDeleteMappingItemDto[];

  @ApiPropertyOptional({
    description: 'Perform hard delete instead of soft delete',
    example: false,
  })
  @IsOptional()
  hardDelete?: boolean = false;
}

export class BulkOperationResultDto {
  @ApiProperty({
    description: 'Number of successful operations',
    example: 8,
  })
  successCount!: number;

  @ApiProperty({
    description: 'Number of failed operations',
    example: 2,
  })
  failureCount!: number;

  @ApiProperty({
    description: 'Total number of operations attempted',
    example: 10,
  })
  totalCount!: number;

  @ApiPropertyOptional({
    description: 'Details of successful operations',
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'success',
      },
    ],
  })
  @IsOptional()
  successDetails?: Array<{
    userId: string;
    storeId: string;
    status: string;
    message?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Details of failed operations',
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174002',
        storeId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'error',
        error: 'Mapping already exists',
      },
    ],
  })
  @IsOptional()
  failureDetails?: Array<{
    userId: string;
    storeId: string;
    status: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Operation completion timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  completedAt!: Date;

  @ApiPropertyOptional({
    description: 'Operation duration in milliseconds',
    example: 1500,
  })
  @IsOptional()
  durationMs?: number;
}
