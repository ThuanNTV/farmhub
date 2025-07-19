import { DeepMocked, createMock } from '@golevelup/ts-jest';

/**
 * Helper utility to create properly typed mock objects for testing
 */
export class MockFactory {
  /**
   * Creates a mock service with all methods properly mocked
   */
  static createMockService<T>(
    serviceClass: new (...args: any[]) => T,
  ): DeepMocked<T> {
    return createMock<T>();
  }

  /**
   * Creates a mock entity with required properties and methods
   */
  static createMockEntity<T>(
    entityClass: new (...args: any[]) => T,
    overrides: Partial<T> = {},
  ): T {
    const mockEntity = createMock<T>(overrides);
    return mockEntity;
  }

  /**
   * Creates a mock repository with common TypeORM methods
   */
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      merge: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn(),
        execute: jest.fn(),
      })),
    };
  }

  /**
   * Creates a mock guard that always allows access
   */
  static createMockGuard() {
    return {
      canActivate: jest.fn().mockReturnValue(true),
    };
  }

  /**
   * Creates a mock interceptor
   */
  static createMockInterceptor() {
    return {
      intercept: jest.fn((context, next) => next.handle()),
    };
  }

  /**
   * Creates mock dependencies for common services
   */
  static createCommonMockDependencies() {
    return {
      mockReflector: {
        get: jest.fn(),
        getAll: jest.fn(),
        getAllAndMerge: jest.fn(),
        getAllAndOverride: jest.fn(),
      },
      mockSecurityService: {
        validateToken: jest.fn().mockResolvedValue(true),
        checkPermissions: jest.fn().mockResolvedValue(true),
        getUserFromToken: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
        }),
      },
      mockTenantDataSourceService: {
        getDataSource: jest.fn(),
        createConnection: jest.fn(),
      },
      mockAuditLogsService: {
        createAuditLog: jest.fn(),
        logAction: jest.fn(),
      },
    };
  }
}

/**
 * Helper to create test entities with proper typing
 */
export function createTestEntity<T>(
  data: Partial<T>,
  entityMethods: Partial<T> = {},
): T {
  const baseEntity = {
    ...data,
    ...entityMethods,
  };

  return baseEntity as T;
}

/**
 * Helper to create mock response objects
 */
export class MockResponseFactory {
  static createSuccessResponse<T>(data: T, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static createErrorResponse(message: string, statusCode = 400) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page = 1,
    limit = 10,
  ) {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

/**
 * Helper to create mock DTOs with validation
 */
export class MockDtoFactory {
  static createValidDto<T>(
    dtoClass: new () => T,
    overrides: Partial<T> = {},
  ): T {
    const dto = new dtoClass();
    return Object.assign(dto, overrides);
  }

  static createInvalidDto<T>(
    dtoClass: new () => T,
    invalidFields: Partial<T>,
  ): T {
    const dto = new dtoClass();
    return Object.assign(dto, invalidFields);
  }
}

/**
 * Common test data generators
 */
export class TestDataGenerator {
  static generateUUID(): string {
    return '123e4567-e89b-12d3-a456-426614174000';
  }

  static generateEmail(): string {
    return 'test@example.com';
  }

  static generatePhoneNumber(): string {
    return '+1234567890';
  }

  static generateDate(daysFromNow = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }

  static generateRandomString(length = 10): string {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static generateRandomNumber(min = 1, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generatePrice(): number {
    return parseFloat((Math.random() * 1000).toFixed(2));
  }

  static generateStockQuantity(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }
}

/**
 * Helper for async testing
 */
export class AsyncTestHelper {
  static async expectToThrow(
    asyncFn: () => Promise<any>,
    expectedError: any,
  ): Promise<void> {
    await expect(asyncFn()).rejects.toThrow(expectedError);
  }

  static async expectToResolve<T>(
    asyncFn: () => Promise<T>,
    expectedValue?: T,
  ): Promise<T> {
    const result = await asyncFn();
    if (expectedValue !== undefined) {
      expect(result).toEqual(expectedValue);
    }
    return result;
  }
}
