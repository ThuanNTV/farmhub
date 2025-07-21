import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
  BulkCreateUserStoreMappingDto,
  BulkUpdateUserStoreMappingDto,
  BulkDeleteUserStoreMappingDto,
  BulkOperationResultDto,
  BulkCreateMappingItemDto,
  BulkUpdateMappingItemDto,
  BulkDeleteMappingItemDto,
} from 'src/modules/user-store-mappings/dto/bulk-operations.dto';
import { UserRole } from 'src/modules/user-store-mappings/dto/user-store-mapping-filter.dto';

describe('BulkCreateMappingItemDto', () => {
  it('should create a valid bulk create item', async () => {
    const itemData = {
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      role: UserRole.STORE_STAFF,
      notes: 'New employee assignment',
    };

    const dto = plainToClass(BulkCreateMappingItemDto, itemData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.userId).toBe(itemData.userId);
    expect(dto.storeId).toBe(itemData.storeId);
    expect(dto.role).toBe(itemData.role);
    expect(dto.notes).toBe(itemData.notes);
  });

  it('should validate UUID fields', async () => {
    const invalidData = {
      userId: 'invalid-uuid',
      storeId: 'invalid-uuid',
      role: UserRole.STORE_STAFF,
    };

    const dto = plainToClass(BulkCreateMappingItemDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'storeId')).toBe(true);
  });

  it('should validate role enum', async () => {
    const invalidData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      storeId: '123e4567-e89b-12d3-a456-426614174001',
      role: 'INVALID_ROLE',
    };

    const dto = plainToClass(BulkCreateMappingItemDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'role')).toBe(true);
  });

  it('should validate notes length', async () => {
    const longNotes = 'a'.repeat(501); // Exceeds 500 character limit
    const invalidData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      storeId: '123e4567-e89b-12d3-a456-426614174001',
      role: UserRole.STORE_STAFF,
      notes: longNotes,
    };

    const dto = plainToClass(BulkCreateMappingItemDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'notes')).toBe(true);
  });

  it('should allow optional notes', async () => {
    const itemData = {
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
      role: UserRole.STORE_STAFF,
    };

    const dto = plainToClass(BulkCreateMappingItemDto, itemData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.notes).toBeUndefined();
  });
});

describe('BulkCreateUserStoreMappingDto', () => {
  it('should create a valid bulk create DTO', async () => {
    const bulkData = {
      mappings: [
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          role: UserRole.STORE_STAFF,
          notes: 'New employee',
        },
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          role: UserRole.STORE_MANAGER,
          notes: 'Promoted manager',
        },
      ],
      skipExistingValidation: false,
    };

    const dto = plainToClass(BulkCreateUserStoreMappingDto, bulkData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.mappings).toHaveLength(2);
    expect(dto.skipExistingValidation).toBe(false);
  });

  it('should validate minimum array size', async () => {
    const invalidData = {
      mappings: [], // Empty array
    };

    const dto = plainToClass(BulkCreateUserStoreMappingDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'mappings')).toBe(true);
  });

  it('should validate maximum array size', async () => {
    const tooManyMappings = Array(51).fill({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      storeId: '123e4567-e89b-12d3-a456-426614174001',
      role: UserRole.STORE_STAFF,
    });

    const invalidData = {
      mappings: tooManyMappings,
    };

    const dto = plainToClass(BulkCreateUserStoreMappingDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'mappings')).toBe(true);
  });

  it('should validate nested mapping items', async () => {
    const invalidData = {
      mappings: [
        {
          userId: 'invalid-uuid',
          storeId: '123e4567-e89b-12d3-a456-426614174001',
          role: UserRole.STORE_STAFF,
        },
      ],
    };

    const dto = plainToClass(BulkCreateUserStoreMappingDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should set default skipExistingValidation', () => {
    const bulkData = {
      mappings: [
        {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          storeId: '123e4567-e89b-12d3-a456-426614174001',
          role: UserRole.STORE_STAFF,
        },
      ],
    };

    const dto = plainToClass(BulkCreateUserStoreMappingDto, bulkData);

    expect(dto.skipExistingValidation).toBe(false);
  });
});

describe('BulkUpdateUserStoreMappingDto', () => {
  it('should create a valid bulk update DTO', async () => {
    const bulkData = {
      mappings: [
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          role: UserRole.STORE_MANAGER,
          notes: 'Promoted to manager',
        },
      ],
    };

    const dto = plainToClass(BulkUpdateUserStoreMappingDto, bulkData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.mappings).toHaveLength(1);
    expect(dto.mappings[0].role).toBe(UserRole.STORE_MANAGER);
  });

  it('should allow partial updates', async () => {
    const bulkData = {
      mappings: [
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          notes: 'Updated notes only',
        },
      ],
    };

    const dto = plainToClass(BulkUpdateUserStoreMappingDto, bulkData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.mappings[0].role).toBeUndefined();
    expect(dto.mappings[0].notes).toBe('Updated notes only');
  });
});

describe('BulkDeleteUserStoreMappingDto', () => {
  it('should create a valid bulk delete DTO', async () => {
    const bulkData = {
      mappings: [
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        },
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        },
      ],
      hardDelete: false,
    };

    const dto = plainToClass(BulkDeleteUserStoreMappingDto, bulkData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.mappings).toHaveLength(2);
    expect(dto.hardDelete).toBe(false);
  });

  it('should set default hardDelete', () => {
    const bulkData = {
      mappings: [
        {
          userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          storeId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        },
      ],
    };

    const dto = plainToClass(BulkDeleteUserStoreMappingDto, bulkData);

    expect(dto.hardDelete).toBe(false);
  });
});

describe('BulkOperationResultDto', () => {
  it('should create a valid bulk operation result', () => {
    const resultData = {
      successCount: 8,
      failureCount: 2,
      totalCount: 10,
      successDetails: [
        {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          storeId: '123e4567-e89b-12d3-a456-426614174001',
          status: 'success',
          message: 'Mapping created successfully',
        },
      ],
      failureDetails: [
        {
          userId: '123e4567-e89b-12d3-a456-426614174002',
          storeId: '123e4567-e89b-12d3-a456-426614174001',
          status: 'error',
          error: 'Mapping already exists',
        },
      ],
      completedAt: new Date('2023-01-01T00:00:00Z'),
      durationMs: 1500,
    };

    const dto = plainToClass(BulkOperationResultDto, resultData);

    expect(dto.successCount).toBe(resultData.successCount);
    expect(dto.failureCount).toBe(resultData.failureCount);
    expect(dto.totalCount).toBe(resultData.totalCount);
    expect(dto.successDetails).toEqual(resultData.successDetails);
    expect(dto.failureDetails).toEqual(resultData.failureDetails);
    expect(dto.completedAt).toEqual(resultData.completedAt);
    expect(dto.durationMs).toBe(resultData.durationMs);
  });

  it('should handle optional fields', () => {
    const minimalData = {
      successCount: 5,
      failureCount: 0,
      totalCount: 5,
      completedAt: new Date(),
    };

    const dto = plainToClass(BulkOperationResultDto, minimalData);

    expect(dto.successCount).toBe(5);
    expect(dto.failureCount).toBe(0);
    expect(dto.totalCount).toBe(5);
    expect(dto.successDetails).toBeUndefined();
    expect(dto.failureDetails).toBeUndefined();
    expect(dto.durationMs).toBeUndefined();
  });
});
