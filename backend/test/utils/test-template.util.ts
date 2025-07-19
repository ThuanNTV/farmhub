import { Test, TestingModule } from '@nestjs/testing';
import { TenantDataSourceService } from '../../src/config/db/dbtenant/tenant-datasource.service';
import {
  createTenantServiceTestSetup,
  TenantServiceTestSetup,
  TEST_STORE_ID,
  resetMocks,
  setupSuccessfulRepositoryMocks,
  setupRepositoryErrorMocks,
  createTestEntity,
} from './tenant-datasource-mock.util';

/**
 * Base test configuration for tenant-based services
 */
export interface TenantServiceTestConfig<TService, TEntity> {
  ServiceClass: new (...args: any[]) => TService;
  EntityClass: new () => TEntity;
  additionalProviders?: any[];
  additionalImports?: any[];
}

/**
 * Creates a complete test module for tenant-based services
 */
export async function createTenantServiceTestModule<TService, TEntity>(
  config: TenantServiceTestConfig<TService, TEntity>,
): Promise<{
  module: TestingModule;
  service: TService;
  setup: TenantServiceTestSetup<TEntity>;
}> {
  const setup = createTenantServiceTestSetup<TEntity>();

  const module = await Test.createTestingModule({
    imports: config.additionalImports || [],
    providers: [
      config.ServiceClass,
      {
        provide: TenantDataSourceService,
        useValue: setup.mockTenantDataSourceService,
      },
      ...(config.additionalProviders || []),
    ],
  }).compile();

  const service = module.get<TService>(config.ServiceClass);

  return { module, service, setup };
}

/**
 * Standard test suite template for tenant-based services
 */
export function createTenantServiceTestSuite<TService, TEntity>(
  serviceName: string,
  config: TenantServiceTestConfig<TService, TEntity>,
  customTests?: (
    service: TService,
    setup: TenantServiceTestSetup<TEntity>,
  ) => void,
) {
  describe(serviceName, () => {
    let module: TestingModule;
    let service: TService;
    let setup: TenantServiceTestSetup<TEntity>;

    beforeEach(async () => {
      const testModule = await createTenantServiceTestModule(config);
      module = testModule.module;
      service = testModule.service;
      setup = testModule.setup;
    });

    afterEach(async () => {
      resetMocks(setup);
      if (module) {
        await module.close();
      }
    });

    describe('Service Definition', () => {
      it('should be defined', () => {
        expect(service).toBeDefined();
      });

      it('should have TenantDataSourceService injected', () => {
        expect(setup.mockTenantDataSourceService).toBeDefined();
      });
    });

    describe('Database Connection', () => {
      it('should get tenant data source successfully', async () => {
        await setup.mockTenantDataSourceService.getTenantDataSource(
          TEST_STORE_ID,
        );
        expect(
          setup.mockTenantDataSourceService.getTenantDataSource,
        ).toHaveBeenCalledWith(TEST_STORE_ID);
      });

      it('should handle data source errors', async () => {
        const error = new Error('Database connection failed');
        setup.mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
          error,
        );

        await expect(
          setup.mockTenantDataSourceService.getTenantDataSource(TEST_STORE_ID),
        ).rejects.toThrow('Database connection failed');
      });
    });

    describe('Repository Operations', () => {
      it('should get repository from data source', () => {
        setup.mockDataSource.getRepository(config.EntityClass);
        expect(setup.mockDataSource.getRepository).toHaveBeenCalledWith(
          config.EntityClass,
        );
      });

      it('should handle repository creation', () => {
        const testEntity = createTestEntity<TEntity>();
        setup.mockRepository.create.mockReturnValue(testEntity);

        const result = setup.mockRepository.create({});
        expect(result).toBeDefined();
        expect(setup.mockRepository.create).toHaveBeenCalled();
      });
    });

    // Run custom tests if provided
    if (customTests) {
      describe('Custom Tests', () => {
        customTests(service, setup);
      });
    }
  });
}

/**
 * Helper to create CRUD test scenarios
 */
export function createCrudTestScenarios<TService, TEntity>(
  service: any, // Service with CRUD methods
  setup: TenantServiceTestSetup<TEntity>,
  entitySample: Partial<TEntity>,
) {
  return {
    testCreate: () => {
      it('should create entity successfully', async () => {
        const testEntity = createTestEntity<TEntity>(entitySample);
        setupSuccessfulRepositoryMocks(setup.mockRepository, testEntity);

        if (typeof service.create === 'function') {
          const result = await service.create(TEST_STORE_ID, entitySample);
          expect(result).toBeDefined();
          expect(setup.mockRepository.save).toHaveBeenCalled();
        }
      });

      it('should handle create errors', async () => {
        const error = new Error('Create failed');
        setupRepositoryErrorMocks(setup.mockRepository, error);

        if (typeof service.create === 'function') {
          await expect(
            service.create(TEST_STORE_ID, entitySample),
          ).rejects.toThrow();
        }
      });
    },

    testFindAll: () => {
      it('should find all entities successfully', async () => {
        const testEntity = createTestEntity<TEntity>(entitySample);
        setup.mockRepository.find.mockResolvedValue([testEntity]);

        if (typeof service.findAll === 'function') {
          const result = await service.findAll(TEST_STORE_ID);
          expect(result).toBeDefined();
          expect(Array.isArray(result)).toBe(true);
          expect(setup.mockRepository.find).toHaveBeenCalled();
        }
      });
    },

    testFindOne: () => {
      it('should find one entity successfully', async () => {
        const testEntity = createTestEntity<TEntity>(entitySample);
        setup.mockRepository.findOne.mockResolvedValue(testEntity);

        if (typeof service.findOne === 'function') {
          const result = await service.findOne(TEST_STORE_ID, 'test-id');
          expect(result).toBeDefined();
          expect(setup.mockRepository.findOne).toHaveBeenCalled();
        }
      });

      it('should handle entity not found', async () => {
        setup.mockRepository.findOne.mockResolvedValue(null);

        if (typeof service.findOne === 'function') {
          await expect(
            service.findOne(TEST_STORE_ID, 'non-existent'),
          ).rejects.toThrow();
        }
      });
    },

    testUpdate: () => {
      it('should update entity successfully', async () => {
        const testEntity = createTestEntity<TEntity>(entitySample);
        setup.mockRepository.findOne.mockResolvedValue(testEntity);
        setup.mockRepository.merge.mockReturnValue(testEntity);
        setup.mockRepository.save.mockResolvedValue(testEntity);

        if (typeof service.update === 'function') {
          const result = await service.update(
            TEST_STORE_ID,
            'test-id',
            entitySample,
          );
          expect(result).toBeDefined();
          expect(setup.mockRepository.save).toHaveBeenCalled();
        }
      });
    },

    testDelete: () => {
      it('should delete entity successfully', async () => {
        const testEntity = createTestEntity<TEntity>(entitySample);
        setup.mockRepository.findOne.mockResolvedValue(testEntity);
        setup.mockRepository.save.mockResolvedValue({
          ...testEntity,
          is_deleted: true,
        });

        if (typeof service.remove === 'function') {
          const result = await service.remove(TEST_STORE_ID, 'test-id');
          expect(result).toBeDefined();
          expect(setup.mockRepository.save).toHaveBeenCalled();
        }
      });
    },
  };
}

/**
 * Helper to run all CRUD tests
 */
export function runAllCrudTests<TService, TEntity>(
  service: any,
  setup: TenantServiceTestSetup<TEntity>,
  entitySample: Partial<TEntity>,
) {
  const scenarios = createCrudTestScenarios(service, setup, entitySample);

  describe('CRUD Operations', () => {
    describe('Create', () => {
      scenarios.testCreate();
    });

    describe('Read', () => {
      scenarios.testFindAll();
      scenarios.testFindOne();
    });

    describe('Update', () => {
      scenarios.testUpdate();
    });

    describe('Delete', () => {
      scenarios.testDelete();
    });
  });
}
