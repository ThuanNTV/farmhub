import { DataSource, Repository, ObjectLiteral } from 'typeorm';
import { TenantDataSourceService } from '../../src/config/db/dbtenant/tenant-datasource.service';

/**
 * Mock Repository interface with all common methods
 */
export interface MockRepository<T extends ObjectLiteral = any> {
  create: jest.MockedFunction<Repository<T>['create']>;
  save: jest.MockedFunction<Repository<T>['save']>;
  find: jest.MockedFunction<Repository<T>['find']>;
  findOne: jest.MockedFunction<Repository<T>['findOne']>;
  findOneBy: jest.MockedFunction<Repository<T>['findOneBy']>;
  findAndCount: jest.MockedFunction<Repository<T>['findAndCount']>;
  count: jest.MockedFunction<Repository<T>['count']>;
  update: jest.MockedFunction<Repository<T>['update']>;
  delete: jest.MockedFunction<Repository<T>['delete']>;
  softDelete: jest.MockedFunction<Repository<T>['softDelete']>;
  merge: jest.MockedFunction<Repository<T>['merge']>;
  createQueryBuilder: jest.MockedFunction<Repository<T>['createQueryBuilder']>;
  manager: any;
  metadata: any;
  target: any;
  queryRunner: any;
}

/**
 * Mock DataSource interface
 */
export interface MockDataSource {
  isInitialized: boolean;
  getRepository: jest.MockedFunction<DataSource['getRepository']>;
  manager: any;
  options: any;
  isConnected: boolean;
  driver: any;
  migrations: any[];
  subscribers: any[];
  entityMetadatas: any[];
  query: jest.MockedFunction<DataSource['query']>;
  transaction: jest.MockedFunction<DataSource['transaction']>;
  initialize: jest.MockedFunction<DataSource['initialize']>;
  destroy: jest.MockedFunction<DataSource['destroy']>;
  synchronize: jest.MockedFunction<DataSource['synchronize']>;
}

/**
 * Mock TenantDataSourceService interface
 */
export interface MockTenantDataSourceService {
  getTenantDataSource: jest.MockedFunction<
    TenantDataSourceService['getTenantDataSource']
  >;
}

/**
 * Creates a mock repository with all common methods
 */
export function createMockRepository<
  T extends ObjectLiteral = any,
>(): MockRepository<T> {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    andHaving: jest.fn().mockReturnThis(),
    orHaving: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    rightJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    rightJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawAndEntities: jest.fn(),
    execute: jest.fn(),
    stream: jest.fn(),
    clone: jest.fn().mockReturnThis(),
    disableEscaping: jest.fn().mockReturnThis(),
    getQuery: jest.fn(),
    getParameters: jest.fn(),
    getSql: jest.fn(),
    printSql: jest.fn(),
    useTransaction: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    setOnLocked: jest.fn().mockReturnThis(),
    getQueryRunner: jest.fn(),
    setQueryRunner: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    loadRelationIdAndMap: jest.fn().mockReturnThis(),
    cache: jest.fn().mockReturnThis(),
    comment: jest.fn().mockReturnThis(),
  };

  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    manager: {},
    metadata: {},
    target: {},
    queryRunner: null,
  } as MockRepository<T>;
}

/**
 * Creates a mock DataSource
 */
export function createMockDataSource(
  mockRepository?: MockRepository,
): MockDataSource {
  const repository = mockRepository ?? createMockRepository();

  return {
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue(repository),
    manager: {},
    options: {},
    isConnected: true,
    driver: {},
    migrations: [],
    subscribers: [],
    entityMetadatas: [],
    query: jest.fn(),
    transaction: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn(),
    synchronize: jest.fn(),
  } as MockDataSource;
}

/**
 * Creates a mock TenantDataSourceService
 */
export function createMockTenantDataSourceService(
  mockDataSource?: MockDataSource,
): MockTenantDataSourceService {
  const dataSource = mockDataSource ?? createMockDataSource();

  return {
    getTenantDataSource: jest.fn().mockResolvedValue(dataSource),
  } as MockTenantDataSourceService;
}

/**
 * Complete test setup for services that depend on TenantDataSourceService
 */
export interface TenantServiceTestSetup<T extends ObjectLiteral = any> {
  mockRepository: MockRepository<T>;
  mockDataSource: MockDataSource;
  mockTenantDataSourceService: MockTenantDataSourceService;
}

/**
 * Creates complete test setup for tenant-based services
 */
export function createTenantServiceTestSetup<
  T extends ObjectLiteral = any,
>(): TenantServiceTestSetup<T> {
  const mockRepository = createMockRepository<T>();
  const mockDataSource = createMockDataSource(mockRepository);
  const mockTenantDataSourceService =
    createMockTenantDataSourceService(mockDataSource);

  return {
    mockRepository,
    mockDataSource,
    mockTenantDataSourceService,
  };
}

/**
 * Helper to setup common test data
 */
export const TEST_STORE_ID = 'test-store-123';
export const TEST_USER_ID = 'test-user-456';

/**
 * Common test entity factory
 */
export function createTestEntity<T>(overrides: Partial<T> = {}): T {
  const baseEntity = {
    id: 'test-id-123',
    created_at: new Date(),
    updated_at: new Date(),
    created_by_user_id: TEST_USER_ID,
    updated_by_user_id: TEST_USER_ID,
    is_deleted: false,
    ...overrides,
  };

  return baseEntity as T;
}

/**
 * Helper to reset all mocks in test setup
 */
export function resetMocks(setup: TenantServiceTestSetup) {
  Object.values(setup.mockRepository).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(setup.mockDataSource).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });

  Object.values(setup.mockTenantDataSourceService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
}

/**
 * Helper to setup successful repository operations
 */
export function setupSuccessfulRepositoryMocks<T extends ObjectLiteral>(
  mockRepository: MockRepository<T>,
  entity: T,
) {
  mockRepository.create.mockReturnValue(entity);
  mockRepository.save.mockResolvedValue(entity);
  mockRepository.findOne.mockResolvedValue(entity);
  mockRepository.find.mockResolvedValue([entity]);
  mockRepository.findAndCount.mockResolvedValue([[entity], 1]);
  mockRepository.count.mockResolvedValue(1);
  mockRepository.update.mockResolvedValue({
    affected: 1,
    generatedMaps: [],
    raw: [],
  });
  mockRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
  mockRepository.merge.mockReturnValue(entity);
}

/**
 * Helper to setup repository error scenarios
 */
export function setupRepositoryErrorMocks<T extends ObjectLiteral>(
  mockRepository: MockRepository<T>,
  error: Error = new Error('Database error'),
) {
  mockRepository.save.mockRejectedValue(error);
  mockRepository.findOne.mockRejectedValue(error);
  mockRepository.find.mockRejectedValue(error);
  mockRepository.update.mockRejectedValue(error);
  mockRepository.delete.mockRejectedValue(error);
}
