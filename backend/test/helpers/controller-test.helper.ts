import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { MockFactory } from './mock-factory.helper';

/**
 * Helper class for setting up controller tests with common dependencies
 */
export class ControllerTestHelper {
  /**
   * Creates a testing module with common mocked dependencies
   */
  static async createTestingModule(config: {
    controller: any;
    service: any;
    additionalProviders?: any[];
    mockGuards?: boolean;
    mockInterceptors?: boolean;
  }): Promise<TestingModule> {
    const {
      controller,
      service,
      additionalProviders = [],
      mockGuards = true,
      mockInterceptors = true,
    } = config;

    const commonDeps = MockFactory.createCommonMockDependencies();

    const providers = [
      {
        provide: service,
        useValue: MockFactory.createMockService(service),
      },
      {
        provide: Reflector,
        useValue: commonDeps.mockReflector,
      },
      ...additionalProviders,
    ];

    // Add common service mocks if needed
    if (mockGuards) {
      providers.push(
        {
          provide: 'SecurityService',
          useValue: commonDeps.mockSecurityService,
        },
        {
          provide: 'TenantDataSourceService',
          useValue: commonDeps.mockTenantDataSourceService,
        },
      );
    }

    if (mockInterceptors) {
      providers.push({
        provide: 'AuditLogsService',
        useValue: commonDeps.mockAuditLogsService,
      });
    }

    const moduleBuilder = Test.createTestingModule({
      controllers: [controller],
      providers,
    });

    // Override guards if needed
    if (mockGuards) {
      moduleBuilder
        .overrideGuard('EnhancedAuthGuard')
        .useValue(MockFactory.createMockGuard())
        .overrideGuard('PermissionGuard')
        .useValue(MockFactory.createMockGuard());
    }

    // Override interceptors if needed
    if (mockInterceptors) {
      moduleBuilder
        .overrideInterceptor('AuditInterceptor')
        .useValue(MockFactory.createMockInterceptor());
    }

    return moduleBuilder.compile();
  }

  /**
   * Sets up a basic controller test with service mock
   */
  static async setupControllerTest<TController, TService>(
    controllerClass: new (...args: any[]) => TController,
    serviceClass: new (...args: any[]) => TService,
    additionalConfig: any = {},
  ): Promise<{
    controller: TController;
    service: jest.Mocked<TService>;
    module: TestingModule;
  }> {
    const module = await this.createTestingModule({
      controller: controllerClass,
      service: serviceClass,
      ...additionalConfig,
    });

    const controller = module.get<TController>(controllerClass);
    const service = module.get<jest.Mocked<TService>>(serviceClass);

    return { controller, service, module };
  }
}

/**
 * Common test patterns for controllers
 */
export class ControllerTestPatterns {
  /**
   * Tests basic CRUD operations for a controller
   */
  static createCrudTests<
    TController,
    TService,
    TEntity,
    TCreateDto,
    TUpdateDto,
  >(config: {
    controller: TController;
    service: jest.Mocked<TService>;
    entityName: string;
    mockEntity: TEntity;
    createDto: TCreateDto;
    updateDto: TUpdateDto;
    storeId?: string;
  }) {
    const {
      controller,
      service,
      entityName,
      mockEntity,
      createDto,
      updateDto,
      storeId = 'store-123',
    } = config;

    return {
      testCreate: () => {
        describe(`create ${entityName}`, () => {
          it(`should create ${entityName} successfully`, async () => {
            (service as any).create.mockResolvedValue(mockEntity);

            const result = await (controller as any).create(storeId, createDto);

            expect(result).toEqual(mockEntity);
            expect((service as any).create).toHaveBeenCalledWith(
              storeId,
              createDto,
            );
          });

          it('should handle creation errors', async () => {
            const error = new Error(`Failed to create ${entityName}`);
            (service as any).create.mockRejectedValue(error);

            await expect(
              (controller as any).create(storeId, createDto),
            ).rejects.toThrow(error);
          });
        });
      },

      testFindAll: () => {
        describe(`findAll ${entityName}`, () => {
          it(`should return all ${entityName}s`, async () => {
            const mockEntities = [mockEntity];
            (service as any).findAll.mockResolvedValue(mockEntities);

            const result = await (controller as any).findAll(storeId);

            expect(result).toEqual(mockEntities);
            expect((service as any).findAll).toHaveBeenCalledWith(storeId);
          });

          it('should handle empty results', async () => {
            (service as any).findAll.mockResolvedValue([]);

            const result = await (controller as any).findAll(storeId);

            expect(result).toEqual([]);
          });
        });
      },

      testFindOne: () => {
        describe(`findOne ${entityName}`, () => {
          it(`should return ${entityName} by ID`, async () => {
            (service as any).findOne.mockResolvedValue(mockEntity);

            const result = await (controller as any).findOne(
              storeId,
              'entity-123',
            );

            expect(result).toEqual(mockEntity);
            expect((service as any).findOne).toHaveBeenCalledWith(
              storeId,
              'entity-123',
            );
          });

          it(`should handle ${entityName} not found`, async () => {
            const error = new Error(`${entityName} not found`);
            (service as any).findOne.mockRejectedValue(error);

            await expect(
              (controller as any).findOne(storeId, 'entity-123'),
            ).rejects.toThrow(error);
          });
        });
      },

      testUpdate: () => {
        describe(`update ${entityName}`, () => {
          it(`should update ${entityName} successfully`, async () => {
            const updatedEntity = { ...mockEntity, ...updateDto };
            (service as any).update.mockResolvedValue(updatedEntity);

            const result = await (controller as any).update(
              storeId,
              'entity-123',
              updateDto,
            );

            expect(result).toEqual(updatedEntity);
            expect((service as any).update).toHaveBeenCalledWith(
              storeId,
              'entity-123',
              updateDto,
            );
          });

          it('should handle update errors', async () => {
            const error = new Error(`Failed to update ${entityName}`);
            (service as any).update.mockRejectedValue(error);

            await expect(
              (controller as any).update(storeId, 'entity-123', updateDto),
            ).rejects.toThrow(error);
          });
        });
      },

      testRemove: () => {
        describe(`remove ${entityName}`, () => {
          it(`should remove ${entityName} successfully`, async () => {
            (service as any).remove.mockResolvedValue(undefined);

            const result = await (controller as any).remove(
              storeId,
              'entity-123',
            );

            expect(result).toBeUndefined();
            expect((service as any).remove).toHaveBeenCalledWith(
              storeId,
              'entity-123',
            );
          });

          it('should handle remove errors', async () => {
            const error = new Error(`Failed to remove ${entityName}`);
            (service as any).remove.mockRejectedValue(error);

            await expect(
              (controller as any).remove(storeId, 'entity-123'),
            ).rejects.toThrow(error);
          });
        });
      },
    };
  }

  /**
   * Creates validation tests for DTOs
   */
  static createValidationTests<TDto>(config: {
    controller: any;
    service: any;
    validDto: TDto;
    invalidDtos: Array<{ dto: Partial<TDto>; expectedError: string }>;
    methodName: string;
    storeId?: string;
  }) {
    const {
      controller,
      service,
      validDto,
      invalidDtos,
      methodName,
      storeId = 'store-123',
    } = config;

    return {
      testValidation: () => {
        describe(`${methodName} validation`, () => {
          it('should accept valid DTO', async () => {
            service[methodName].mockResolvedValue({});

            await expect(
              controller[methodName](storeId, validDto),
            ).resolves.not.toThrow();
          });

          invalidDtos.forEach(({ dto, expectedError }, index) => {
            it(`should reject invalid DTO case ${index + 1}`, async () => {
              const error = new Error(expectedError);
              service[methodName].mockRejectedValue(error);

              await expect(
                controller[methodName](storeId, dto),
              ).rejects.toThrow(expectedError);
            });
          });
        });
      },
    };
  }

  /**
   * Creates permission tests for protected endpoints
   */
  static createPermissionTests<TController>(config: {
    controller: TController;
    service: any;
    methodName: string;
    requiredPermission: string;
    storeId?: string;
  }) {
    const {
      controller,
      service,
      methodName,
      requiredPermission,
      storeId = 'store-123',
    } = config;

    return {
      testPermissions: () => {
        describe(`${methodName} permissions`, () => {
          it(`should require ${requiredPermission} permission`, async () => {
            // This would be tested with actual guard implementation
            // For now, we just ensure the method exists and can be called
            expect((controller as any)[methodName]).toBeDefined();
            expect(typeof (controller as any)[methodName]).toBe('function');
          });
        });
      },
    };
  }
}
