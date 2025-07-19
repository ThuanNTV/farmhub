import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DebtTransactionsController } from '@modules/debt-transactions/controller/debt-transactions.controller';
import { DebtTransactionsService } from '@modules/debt-transactions/service/debt-transactions.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockDebtTransactionsService,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('DebtTransactionsController', () => {
  let controller: DebtTransactionsController;
  let debtTransactionsService: jest.Mocked<DebtTransactionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtTransactionsController],
      providers: [
        {
          provide: DebtTransactionsService,
          useValue: mockDebtTransactionsService,
        },
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

    controller = module.get<DebtTransactionsController>(
      DebtTransactionsController,
    );
    debtTransactionsService = module.get<jest.Mocked<DebtTransactionsService>>(
      DebtTransactionsService,
    );
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
      customerId: 'customer-123',
      amount: 100,
      type: 'debit',
      description: 'Test debt transaction',
    };

    it('should create debt transaction successfully', async () => {
      const mockDebtTransaction = { id: '1', ...createDto };
      debtTransactionsService.create.mockResolvedValue(
        mockDebtTransaction as any,
      );

      const result = await controller.create(storeId, createDto as any);

      expect(debtTransactionsService.create).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
      expect(result).toEqual(mockDebtTransaction);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      debtTransactionsService.create.mockRejectedValue(error);

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    const storeId = 'test-store-123';

    it('should find all debt transactions successfully', async () => {
      const mockDebtTransactions = [{ id: '1', amount: 100 }];
      debtTransactionsService.findAll.mockResolvedValue(
        mockDebtTransactions as any,
      );

      const result = await controller.findAll(storeId);

      expect(debtTransactionsService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockDebtTransactions);
    });
  });
});
