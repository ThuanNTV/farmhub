import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PromotionsController } from '@modules/promotions/controller/promotions.controller';
import { PromotionsService } from '@modules/promotions/service/promotions.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockPromotionsService,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('PromotionsController', () => {
  let controller: PromotionsController;
  let promotionsService: jest.Mocked<PromotionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [
        { provide: PromotionsService, useValue: mockPromotionsService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
        { provide: AuditInterceptor, useValue: mockAuditInterceptor },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockEnhancedAuthGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue(mockAuditInterceptor)
      .compile();

    controller = module.get<PromotionsController>(PromotionsController);
    promotionsService =
      module.get<jest.Mocked<PromotionsService>>(PromotionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const storeId = 'test-store-123';
    const createDto = {
      name: 'Test Promotion',
      description: 'Test promotion description',
      type: 'percentage',
      value: '10',
      appliesTo: 'all',
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      createdByUserId: 'user-123',
      updatedByUserId: 'user-123',
    };

    it('should create promotion successfully', async () => {
      const mockPromotion = { id: '1', ...createDto };
      promotionsService.create.mockResolvedValue(mockPromotion as any);

      const result = await controller.create(storeId, createDto as any);

      // The controller transforms the DTO before passing to service
      const expectedEntityData = {
        ...createDto,
        type: 'percentage', // Controller transforms to enum value (PromotionType.PERCENTAGE = 'percentage')
        applies_to: createDto.appliesTo,
        start_date: createDto.startDate,
        end_date: createDto.endDate,
        is_active: createDto.isActive,
        created_by_user_id: createDto.createdByUserId,
        updated_by_user_id: createDto.updatedByUserId,
      };

      expect(promotionsService.create).toHaveBeenCalledWith(
        storeId,
        expectedEntityData,
      );
      expect(result).toEqual(mockPromotion);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      promotionsService.create.mockRejectedValue(error);

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    const storeId = 'test-store-123';

    it('should find all promotions successfully', async () => {
      const mockPromotions = [{ id: '1', name: 'Test Promotion' }];
      promotionsService.findAll.mockResolvedValue(mockPromotions as any);

      const result = await controller.findAll(storeId);

      expect(promotionsService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockPromotions);
    });
  });
});
