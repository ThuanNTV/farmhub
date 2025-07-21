import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
  UserStoreMappingFilterDto,
  UserRole,
  SortOrder,
  UserStoreMappingSortBy,
  PaginatedUserStoreMappingResponseDto,
  UserStoreMappingStatsDto,
} from 'src/modules/user-store-mappings/dto/user-store-mapping-filter.dto';

describe('UserStoreMappingFilterDto', () => {
  it('should create a valid filter with all fields', async () => {
    const filterData = {
      role: UserRole.STORE_STAFF,
      roles: [UserRole.STORE_STAFF, UserRole.STORE_MANAGER],
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-12-31T23:59:59Z',
      userSearch: 'john',
      storeSearch: 'main store',
      page: 1,
      limit: 10,
      sortBy: UserStoreMappingSortBy.CREATED_AT,
      sortOrder: SortOrder.DESC,
      includeDeleted: false,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, filterData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.role).toBe(filterData.role);
    expect(dto.roles).toEqual(filterData.roles);
    expect(dto.startDate).toBe(filterData.startDate);
    expect(dto.endDate).toBe(filterData.endDate);
    expect(dto.userSearch).toBe(filterData.userSearch);
    expect(dto.storeSearch).toBe(filterData.storeSearch);
    expect(dto.page).toBe(filterData.page);
    expect(dto.limit).toBe(filterData.limit);
    expect(dto.sortBy).toBe(filterData.sortBy);
    expect(dto.sortOrder).toBe(filterData.sortOrder);
    expect(dto.includeDeleted).toBe(filterData.includeDeleted);
  });

  it('should create a valid filter with minimal fields', async () => {
    const filterData = {
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, filterData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sortBy).toBe(UserStoreMappingSortBy.CREATED_AT);
    expect(dto.sortOrder).toBe(SortOrder.DESC);
    expect(dto.includeDeleted).toBe(false);
  });

  it('should validate UUID fields', async () => {
    const invalidData = {
      userId: 'invalid-uuid',
      storeId: 'invalid-uuid',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'userId')).toBe(true);
    expect(errors.some((error) => error.property === 'storeId')).toBe(true);
  });

  it('should validate page constraints', async () => {
    const invalidData = {
      page: 0, // Should be >= 1
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'page')).toBe(true);
  });

  it('should validate limit constraints', async () => {
    const invalidData = {
      page: 1,
      limit: 101, // Should be <= 100
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('should validate role enum', async () => {
    const invalidData = {
      role: 'INVALID_ROLE',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'role')).toBe(true);
  });

  it('should validate roles array', async () => {
    const invalidData = {
      roles: ['INVALID_ROLE', 'ANOTHER_INVALID'],
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'roles')).toBe(true);
  });

  it('should validate array size limits', async () => {
    const tooManyIds = Array(51).fill('123e4567-e89b-12d3-a456-426614174000');
    const invalidData = {
      userIds: tooManyIds,
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'userIds')).toBe(true);
  });

  it('should validate date strings', async () => {
    const invalidData = {
      startDate: 'invalid-date',
      endDate: 'invalid-date',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'startDate')).toBe(true);
    expect(errors.some((error) => error.property === 'endDate')).toBe(true);
  });

  it('should validate sort by enum', async () => {
    const invalidData = {
      sortBy: 'invalid_sort_field',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'sortBy')).toBe(true);
  });

  it('should validate sort order enum', async () => {
    const invalidData = {
      sortOrder: 'INVALID_ORDER',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'sortOrder')).toBe(true);
  });

  it('should trim string values', () => {
    const filterData = {
      userSearch: '  john  ',
      storeSearch: '  main store  ',
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(UserStoreMappingFilterDto, filterData);

    expect(dto.userSearch).toBe('john');
    expect(dto.storeSearch).toBe('main store');
  });

  it('should handle boolean transformation for includeDeleted', () => {
    const filterData1 = {
      includeDeleted: 'true',
      page: 1,
      limit: 10,
    };

    const filterData2 = {
      includeDeleted: 'false',
      page: 1,
      limit: 10,
    };

    const dto1 = plainToClass(UserStoreMappingFilterDto, filterData1);
    const dto2 = plainToClass(UserStoreMappingFilterDto, filterData2);

    expect(dto1.includeDeleted).toBe(true);
    expect(dto2.includeDeleted).toBe(false);
  });
});

describe('PaginatedUserStoreMappingResponseDto', () => {
  it('should create valid paginated response', () => {
    const paginatedData = {
      data: [
        {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          storeId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'STORE_STAFF',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          storeName: 'Main Store',
          storeAddress: '123 Main St',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      appliedFilters: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: UserRole.STORE_STAFF,
      },
      generatedAt: new Date(),
    };

    const dto = plainToClass(
      PaginatedUserStoreMappingResponseDto,
      paginatedData,
    );

    expect(dto.data).toEqual(paginatedData.data);
    expect(dto.pagination).toEqual(paginatedData.pagination);
    expect(dto.appliedFilters).toEqual(paginatedData.appliedFilters);
    expect(dto.generatedAt).toEqual(paginatedData.generatedAt);
  });
});

describe('UserStoreMappingStatsDto', () => {
  it('should create valid stats', () => {
    const statsData = {
      totalMappings: 100,
      mappingsByRole: {
        STORE_STAFF: 60,
        STORE_MANAGER: 30,
        VIEWER: 10,
      },
      activeMappings: 95,
      deletedMappings: 5,
      topActiveStores: [
        {
          storeId: 'store-1',
          storeName: 'Main Store',
          userCount: 25,
        },
        {
          storeId: 'store-2',
          storeName: 'Branch Store',
          userCount: 20,
        },
      ],
      recentActivity: [
        {
          action: 'CREATE',
          userId: 'user-1',
          userName: 'John Doe',
          storeId: 'store-1',
          storeName: 'Main Store',
          createdAt: new Date('2023-01-01T00:00:00Z'),
        },
      ],
      generatedAt: new Date(),
    };

    const dto = plainToClass(UserStoreMappingStatsDto, statsData);

    expect(dto.totalMappings).toBe(statsData.totalMappings);
    expect(dto.mappingsByRole).toEqual(statsData.mappingsByRole);
    expect(dto.activeMappings).toBe(statsData.activeMappings);
    expect(dto.deletedMappings).toBe(statsData.deletedMappings);
    expect(dto.topActiveStores).toEqual(statsData.topActiveStores);
    expect(dto.recentActivity).toEqual(statsData.recentActivity);
    expect(dto.generatedAt).toEqual(statsData.generatedAt);
  });
});
