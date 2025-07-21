import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { InstallmentsController } from '@modules/installments/controller/installments.controller';
import { InstallmentsService } from '@modules/installments/service/installments.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('InstallmentsController', () => {
  let controller: InstallmentsController;
  let installmentsService: jest.Mocked<InstallmentsService>;

  beforeEach(async () => {
    const mockInstallmentsService = {
      createInstallment: jest.fn(),
      findAllInstallments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallmentsController],
      providers: [
        { provide: InstallmentsService, useValue: mockInstallmentsService },
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

    controller = module.get<InstallmentsController>(InstallmentsController);
    installmentsService =
      module.get<jest.Mocked<InstallmentsService>>(InstallmentsService);
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
      orderId: 'order-123',
      amount: 100,
      dueDate: new Date(),
      installmentNumber: 1,
    };

    it('should create installment successfully', async () => {
      const mockInstallment = { id: '1', ...createDto };
      installmentsService.createInstallment.mockResolvedValue(
        mockInstallment as any,
      );

      const result = await controller.create(storeId, createDto as any);

      expect(installmentsService.createInstallment).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
      expect(result).toEqual(mockInstallment);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      installmentsService.createInstallment.mockRejectedValue(error);

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    const storeId = 'test-store-123';

    it('should find all installments successfully', async () => {
      const mockInstallments = [{ id: '1', amount: 100 }];
      installmentsService.findAllInstallments.mockResolvedValue(
        mockInstallments as any,
      );

      const result = await controller.findAll(storeId);

      expect(installmentsService.findAllInstallments).toHaveBeenCalledWith(
        storeId,
      );
      expect(result).toEqual(mockInstallments);
    });
  });
});
