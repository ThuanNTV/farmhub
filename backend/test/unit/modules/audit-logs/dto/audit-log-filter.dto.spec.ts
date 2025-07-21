import {
  AuditLogFilterDto,
  DateRangeDto,
  AuditLogStatsDto,
  PaginatedAuditLogResponseDto,
} from 'src/modules/audit-logs/dto/audit-log-filter.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('AuditLogFilterDto', () => {
  it('should create a valid filter with all fields', async () => {
    const filterData = {
      userId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID
      action: 'CREATE',
      actions: ['CREATE', 'UPDATE'],
      targetTable: 'products',
      targetTables: ['products', 'users'],
      targetId: '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
      startDate: '2023-01-01T00:00:00Z', // ISO string
      endDate: '2023-12-31T23:59:59Z', // ISO string
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC' as const,
    };

    const dto = plainToClass(AuditLogFilterDto, filterData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.userId).toBe(filterData.userId);
    expect(dto.action).toBe(filterData.action);
    expect(dto.actions).toEqual(filterData.actions);
    expect(dto.targetTable).toBe(filterData.targetTable);
    expect(dto.targetTables).toEqual(filterData.targetTables);
    expect(dto.targetId).toBe(filterData.targetId);
    expect(dto.startDate).toEqual(filterData.startDate);
    expect(dto.endDate).toEqual(filterData.endDate);
    expect(dto.page).toBe(filterData.page);
    expect(dto.limit).toBe(filterData.limit);
    expect(dto.sortBy).toBe(filterData.sortBy);
    expect(dto.sortOrder).toBe(filterData.sortOrder);
  });

  it('should create a valid filter with minimal fields', async () => {
    const filterData = {
      page: 1,
      limit: 10,
    };

    const dto = plainToClass(AuditLogFilterDto, filterData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should validate page constraints', async () => {
    const invalidData = {
      page: 0, // Should be >= 1
      limit: 10,
    };

    const dto = plainToClass(AuditLogFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'page')).toBe(true);
  });

  it('should validate limit constraints', async () => {
    const invalidData = {
      page: 1,
      limit: 101, // Should be <= 100
    };

    const dto = plainToClass(AuditLogFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });

  it('should validate sortOrder enum', async () => {
    const invalidData = {
      page: 1,
      limit: 10,
      sortOrder: 'INVALID' as any,
    };

    const dto = plainToClass(AuditLogFilterDto, invalidData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((error) => error.property === 'sortOrder')).toBe(true);
  });
});

describe('DateRangeDto', () => {
  it('should create a valid date range', async () => {
    const dateRangeData = {
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-12-31T23:59:59Z',
    };

    const dto = plainToClass(DateRangeDto, dateRangeData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.startDate).toEqual(dateRangeData.startDate);
    expect(dto.endDate).toEqual(dateRangeData.endDate);
  });

  it('should handle missing required fields', async () => {
    const dto = plainToClass(DateRangeDto, {});
    const errors = await validate(dto);

    // DateRangeDto requires both startDate and endDate
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('AuditLogStatsDto', () => {
  it('should create valid stats', () => {
    const statsData = {
      totalLogs: 100,
      logsByAction: {
        CREATE: 50,
        UPDATE: 30,
        DELETE: 20,
      },
      logsByUser: {
        'user-1': 60,
        'user-2': 40,
      },
      logsByTable: {
        products: 70,
        users: 30,
      },
      logsByDevice: {
        desktop: 80,
        mobile: 20,
      },
      logsByBrowser: {
        chrome: 60,
        firefox: 40,
      },
      recentActivity: [
        {
          action: 'CREATE',
          targetTable: 'products',
          userName: 'John Doe',
          createdAt: new Date('2023-01-01'),
          count: 5,
        },
      ],
      dailyStats: [
        { date: '2023-01-01', count: 10 },
        { date: '2023-01-02', count: 15 },
      ],
      topActiveUsers: [
        {
          userId: 'user-1',
          userName: 'John Doe',
          actionCount: 50,
          lastActivity: new Date('2023-01-01'),
        },
      ],
      generatedAt: new Date('2023-01-01'),
    };

    const dto = plainToClass(AuditLogStatsDto, statsData);

    expect(dto.totalLogs).toBe(statsData.totalLogs);
    expect(dto.logsByAction).toEqual(statsData.logsByAction);
    expect(dto.logsByUser).toEqual(statsData.logsByUser);
    expect(dto.logsByTable).toEqual(statsData.logsByTable);
    expect(dto.logsByDevice).toEqual(statsData.logsByDevice);
    expect(dto.logsByBrowser).toEqual(statsData.logsByBrowser);
    expect(dto.recentActivity).toEqual(statsData.recentActivity);
    expect(dto.dailyStats).toEqual(statsData.dailyStats);
    expect(dto.topActiveUsers).toEqual(statsData.topActiveUsers);
    expect(dto.generatedAt).toEqual(statsData.generatedAt);
  });
});

describe('PaginatedAuditLogResponseDto', () => {
  it('should create valid paginated response', () => {
    const paginatedData = {
      data: [
        {
          id: 'audit-1',
          userId: 'user-1',
          action: 'CREATE',
          targetTable: 'products',
          targetId: 'product-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
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
        userId: 'user-1',
        action: 'CREATE',
      },
      generatedAt: new Date(),
    };

    const dto = plainToClass(PaginatedAuditLogResponseDto, paginatedData);

    expect(dto.data).toEqual(paginatedData.data);
    expect(dto.pagination).toEqual(paginatedData.pagination);
    expect(dto.appliedFilters).toEqual(paginatedData.appliedFilters);
    expect(dto.generatedAt).toEqual(paginatedData.generatedAt);
  });
});
