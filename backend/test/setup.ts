import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Increase timeout for integration tests
  jest.setTimeout(30000);
});

// Global test teardown
afterAll(async () => {
  // Clean up any global resources
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock bcrypt to avoid slow hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock JWT to avoid token generation issues
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: '1', username: 'testuser' }),
    decode: jest.fn().mockReturnValue({ sub: '1', username: 'testuser' }),
  })),
}));

// Mock TypeORM to avoid database connections in unit tests
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockModule {},
      providers: [],
    }),
    forFeature: jest.fn().mockReturnValue({
      module: class MockModule {},
      providers: [],
    }),
  },
  getRepositoryToken: jest.fn().mockReturnValue('MockRepositoryToken'),
}));

// Mock TenantDataSourceService
jest.mock('../src/config/db/dbtenant/tenant-datasource.service', () => ({
  TenantDataSourceService: jest.fn().mockImplementation(() => ({
    getTenantDataSource: jest.fn().mockResolvedValue({
      isInitialized: true,
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        merge: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn(),
          getOne: jest.fn(),
        })),
      }),
    }),
  })),
}));

// Mock external services
jest.mock('../src/modules/products/service/products.service', () => ({
  ProductsService: jest.fn().mockImplementation(() => ({
    findById: jest
      .fn()
      .mockResolvedValue({ product_id: '1', product_name: 'Test Product' }),
  })),
}));

// Mock guards and interceptors
jest.mock('../src/common/auth/enhanced-auth.guard', () => ({
  EnhancedAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../src/core/rbac/permission/permission.guard', () => ({
  PermissionGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../src/common/auth/audit.interceptor', () => ({
  AuditInterceptor: jest.fn().mockImplementation(() => ({
    intercept: jest.fn().mockImplementation((context, next) => next.handle()),
  })),
}));

// Mock decorators
jest.mock('../src/common/decorator/rate-limit.decorator', () => ({
  RateLimitAPI: jest.fn().mockReturnValue(() => {}),
}));

jest.mock('../src/core/rbac/permission/permissions.decorator', () => ({
  RequireUserPermission: jest.fn().mockReturnValue(() => {}),
  RequireOrderPermission: jest.fn().mockReturnValue(() => {}),
}));

// Mock DTO mapper
jest.mock('../src/common/helpers/dto-mapper.helper', () => ({
  DtoMapper: {
    mapToEntity: jest.fn().mockImplementation((data) => data),
  },
}));

// Mock logger
jest.mock('@nestjs/common', () => {
  const ActualNestCommon = jest.requireActual('@nestjs/common');
  return {
    ...ActualNestCommon,
    Logger: Object.assign(
      jest.fn().mockImplementation(() => ({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      })),
      {
        overrideLogger: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      },
    ),
  };
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    user_id: '1',
    user_name: 'testuser',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'STORE_MANAGER',
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  }),

  createMockOrder: () => ({
    order_id: '1',
    order_code: 'ORD-001',
    customer_id: 'customer1',
    total_amount: 1000,
    total_paid: 1000,
    discount_amount: 0,
    shipping_fee: 0,
    status: 'PENDING',
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    order_items: [],
  }),

  createMockProduct: () => ({
    product_id: '1',
    product_name: 'Test Product',
    product_code: 'PROD-001',
    description: 'Test product description',
    category_id: 'category1',
    supplier_id: 'supplier1',
    unit_price: 100,
    cost_price: 80,
    stock_quantity: 50,
    min_stock_level: 10,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  }),

  createMockRepository: () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  }),
};

// Extend Jest matchers
expect.extend({
  toBeValidJWT(received) {
    const pass =
      typeof received === 'string' && received.split('.').length === 3;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// Declare global types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidJWT(): R;
      toBeValidUUID(): R;
    }
  }

  var testUtils: {
    createMockUser: () => any;
    createMockOrder: () => any;
    createMockProduct: () => any;
    createMockRepository: () => any;
  };
}

export {};
