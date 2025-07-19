import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * Mock SecurityService for testing
 */
export const mockSecurityService = {
  createSession: jest.fn(),
  validateToken: jest.fn(),
  blacklistToken: jest.fn(),
  isTokenBlacklisted: jest.fn().mockReturnValue(false),
  recordFailedLoginAttempt: jest.fn(),
  recordSuccessfulLogin: jest.fn(),
  isUserBlocked: jest.fn().mockReturnValue(false),
  getSecurityReport: jest.fn().mockReturnValue({
    activeSessions: 0,
    blacklistedTokens: 0,
    blockedUsers: 0,
  }),
  cleanupExpiredRecords: jest.fn(),
};

/**
 * Mock AuditLogAsyncService for testing
 */
export const mockAuditLogAsyncService = {
  logCreate: jest.fn().mockResolvedValue(undefined),
  logUpdate: jest.fn().mockResolvedValue(undefined),
  logDelete: jest.fn().mockResolvedValue(undefined),
  logRestore: jest.fn().mockResolvedValue(undefined),
  logCustomAction: jest.fn().mockResolvedValue(undefined),
  logBulkActions: jest.fn().mockResolvedValue(undefined),
  getQueueStatus: jest
    .fn()
    .mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
  clearQueue: jest.fn().mockResolvedValue(undefined),
};

/**
 * Mock AuditLogQueueService for testing
 */
export const mockAuditLogQueueService = {
  addAuditLog: jest.fn().mockResolvedValue(undefined),
  addBulkAuditLogs: jest.fn().mockResolvedValue(undefined),
  getQueueStatus: jest
    .fn()
    .mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
  clearQueue: jest.fn().mockResolvedValue(undefined),
};

/**
 * Mock Reflector for testing
 */
export const mockReflector = {
  get: jest.fn(),
  getAll: jest.fn(),
  getAllAndMerge: jest.fn(),
  getAllAndOverride: jest.fn(),
};

/**
 * Mock JwtService for testing
 */
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
  signAsync: jest.fn().mockResolvedValue('mock-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user', username: 'test' }),
  verifyAsync: jest
    .fn()
    .mockResolvedValue({ userId: 'test-user', username: 'test' }),
  decode: jest.fn().mockReturnValue({ userId: 'test-user', username: 'test' }),
};

/**
 * Mock EnhancedAuthGuard for testing
 */
export const mockEnhancedAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

/**
 * Mock PermissionGuard for testing
 */
export const mockPermissionGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

/**
 * Mock AuditInterceptor for testing
 */
export const mockAuditInterceptor = {
  intercept: jest.fn((context, next) => next.handle()),
};

/**
 * Mock OrdersService for testing
 */
export const mockOrdersService = {
  createOrder: jest.fn(),
  findAllOrder: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  confirmOrder: jest.fn(),
  shipOrder: jest.fn(),
  completeOrder: jest.fn(),
  cancelOrder: jest.fn(),
  findByStatus: jest.fn(),
  findByCustomer: jest.fn(),
  recreateOrder: jest.fn(),
};

/**
 * Mock TenantDataSourceService for testing
 */
export const mockTenantDataSourceService = {
  getTenantDataSource: jest.fn(),
  createTenantDataSource: jest.fn(),
  closeTenantDataSource: jest.fn(),
  getAllTenantDataSources: jest.fn(),
};

/**
 * Mock WebhookLogsService for testing
 */
export const mockWebhookLogsService = {
  createWebhookLogs: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  getStats: jest.fn(),
  findByType: jest.fn(),
  findByEventType: jest.fn(),
  findByStatus: jest.fn(),
};

/**
 * Mock PromotionsService for testing
 */
export const mockPromotionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  findActive: jest.fn(),
  findByType: jest.fn(),
};

/**
 * Mock VouchersService for testing
 */
export const mockVouchersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  findActive: jest.fn(),
  findByCode: jest.fn(),
  validateVoucher: jest.fn(),
};

/**
 * Mock DebtTransactionsService for testing
 */
export const mockDebtTransactionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  findByCustomer: jest.fn(),
  findByType: jest.fn(),
  getCustomerDebtSummary: jest.fn(),
};

/**
 * Mock InstallmentsService for testing
 */
export const mockInstallmentsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
  findByOrder: jest.fn(),
  findByCustomer: jest.fn(),
  findOverdue: jest.fn(),
};

/**
 * Mock AuthService for testing
 */
export const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  validateUser: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  changePassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
};

/**
 * Common mock providers for testing controllers with guards and interceptors
 */
export const getCommonMockProviders = () => [
  { provide: 'SecurityService', useValue: mockSecurityService },
  { provide: 'AuditLogAsyncService', useValue: mockAuditLogAsyncService },
  { provide: 'AuditLogQueueService', useValue: mockAuditLogQueueService },
  { provide: Reflector, useValue: mockReflector },
  { provide: JwtService, useValue: mockJwtService },
  { provide: 'EnhancedAuthGuard', useValue: mockEnhancedAuthGuard },
  { provide: 'PermissionGuard', useValue: mockPermissionGuard },
  { provide: 'AuditInterceptor', useValue: mockAuditInterceptor },
  { provide: 'TenantDataSourceService', useValue: mockTenantDataSourceService },
  { provide: 'AuthService', useValue: mockAuthService },
];

/**
 * Helper function to create a test module with common mocks
 */
export const createTestModuleWithMocks = async (
  controllers: any[],
  additionalProviders: any[] = [],
  additionalImports: any[] = [],
) => {
  const { Test } = await import('@nestjs/testing');

  return Test.createTestingModule({
    imports: additionalImports,
    controllers,
    providers: [...getCommonMockProviders(), ...additionalProviders],
  });
};
