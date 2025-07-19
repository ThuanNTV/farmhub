/**
 * Test Helpers Index
 *
 * This file exports all test helper utilities for easy importing
 */

// Core mock factory
export {
  MockFactory,
  createTestEntity,
  MockResponseFactory,
  MockDtoFactory,
  TestDataGenerator,
  AsyncTestHelper,
} from './mock-factory.helper';

// Entity mocks
export {
  EntityMockHelper,
  EntityCollectionHelper,
} from './entity-mocks.helper';

// DTO mocks
export { DtoMockHelper } from './dto-mocks.helper';

// Controller test helpers
export {
  ControllerTestHelper,
  ControllerTestPatterns,
} from './controller-test.helper';

/**
 * Quick start guide:
 *
 * 1. Import what you need:
 *    ```typescript
 *    import {
 *      ControllerTestHelper,
 *      EntityMockHelper,
 *      DtoMockHelper,
 *      TestDataGenerator
 *    } from '../helpers';
 *    ```
 *
 * 2. Setup controller test:
 *    ```typescript
 *    const { controller, service } = await ControllerTestHelper.setupControllerTest(
 *      ProductsController,
 *      ProductsService
 *    );
 *    ```
 *
 * 3. Create mock data:
 *    ```typescript
 *    const mockProduct = EntityMockHelper.createMockProduct();
 *    const createDto = DtoMockHelper.createValidCreateProductDto();
 *    ```
 *
 * 4. Use test patterns:
 *    ```typescript
 *    const crudTests = ControllerTestPatterns.createCrudTests({
 *      controller,
 *      service,
 *      entityName: 'Product',
 *      mockEntity: mockProduct,
 *      createDto,
 *      updateDto,
 *    });
 *
 *    crudTests.testCreate();
 *    crudTests.testFindAll();
 *    // etc.
 *    ```
 */

/**
 * Common test utilities that can be used across all test files
 */
export class TestUtils {
  /**
   * Creates a complete test setup for a controller
   */
  static async createControllerTestSetup<TController, TService>(
    controllerClass: new (...args: any[]) => TController,
    serviceClass: new (...args: any[]) => TService,
    entityMockCreator: () => any,
    dtoMockCreator: () => any,
  ) {
    const { controller, service, module } =
      await ControllerTestHelper.setupControllerTest(
        controllerClass,
        serviceClass,
      );

    const mockEntity = entityMockCreator();
    const mockDto = dtoMockCreator();
    const storeId = TestDataGenerator.generateUUID();

    return {
      controller,
      service,
      module,
      mockEntity,
      mockDto,
      storeId,
      cleanup: async () => await module.close(),
    };
  }

  /**
   * Creates a standard test suite for CRUD operations
   */
  static createStandardTestSuite<TController, TService>(config: {
    controller: TController;
    service: jest.Mocked<TService>;
    entityName: string;
    mockEntity: any;
    createDto: any;
    updateDto: any;
    storeId: string;
  }) {
    const crudTests = ControllerTestPatterns.createCrudTests(config);

    return {
      runAllTests: () => {
        crudTests.testCreate();
        crudTests.testFindAll();
        crudTests.testFindOne();
        crudTests.testUpdate();
        crudTests.testRemove();
      },
      crudTests,
    };
  }

  /**
   * Creates validation test suite
   */
  static createValidationTestSuite(config: {
    controller: any;
    service: any;
    validDto: any;
    invalidDtos: Array<{ dto: any; expectedError: string }>;
    methodName: string;
    storeId: string;
  }) {
    const validationTests =
      ControllerTestPatterns.createValidationTests(config);

    return {
      runValidationTests: () => {
        validationTests.testValidation();
      },
      validationTests,
    };
  }

  /**
   * Helper to run common test scenarios
   */
  static runCommonScenarios(config: {
    controller: any;
    service: any;
    mockEntity: any;
    createDto: any;
    updateDto: any;
    storeId: string;
    entityName: string;
  }) {
    const {
      controller,
      service,
      mockEntity,
      createDto,
      updateDto,
      storeId,
      entityName,
    } = config;

    describe('Common Scenarios', () => {
      it('should handle service errors gracefully', async () => {
        const error = new Error(`${entityName} service error`);
        service.create.mockRejectedValue(error);

        await expect(controller.create(storeId, createDto)).rejects.toThrow(
          error,
        );
      });

      it('should handle empty responses', async () => {
        service.findAll.mockResolvedValue([]);

        const result = await controller.findAll(storeId);

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
      });

      it('should handle null responses', async () => {
        service.findOne.mockResolvedValue(null);

        const result = await controller.findOne(storeId, 'non-existent-id');

        expect(result).toBeNull();
      });
    });
  }
}

/**
 * Constants for testing
 */
export const TEST_CONSTANTS = {
  DEFAULT_STORE_ID: 'test-store-123',
  DEFAULT_USER_ID: 'test-user-123',
  DEFAULT_TIMEOUT: 5000,
  LARGE_DATASET_SIZE: 1000,
  PERFORMANCE_THRESHOLD_MS: 1000,
};

/**
 * Common assertions
 */
export class TestAssertions {
  static expectValidUUID(value: string) {
    expect(value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  }

  static expectValidEmail(value: string) {
    expect(value).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  static expectValidPhoneNumber(value: string) {
    expect(value).toMatch(/^\+?[\d\s\-\(\)]+$/);
  }

  static expectValidDate(value: any) {
    expect(value).toBeInstanceOf(Date);
    expect(value.getTime()).not.toBeNaN();
  }

  static expectValidPrice(value: number) {
    expect(value).toBeGreaterThan(0);
    expect(Number.isFinite(value)).toBe(true);
  }

  static expectValidStock(value: number) {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(value)).toBe(true);
  }
}
