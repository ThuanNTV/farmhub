import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { VouchersController } from '@modules/vouchers/controller/vouchers.controller';
import { VouchersService } from '@modules/vouchers/service/vouchers.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockVouchersService,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

describe('VouchersController', () => {
  let controller: VouchersController;
  let vouchersService: jest.Mocked<VouchersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VouchersController],
      providers: [
        { provide: VouchersService, useValue: mockVouchersService },
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

    controller = module.get<VouchersController>(VouchersController);
    vouchersService = module.get<jest.Mocked<VouchersService>>(VouchersService);
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
      code: 'VOUCHER123',
      name: 'Test Voucher',
      description: 'Test voucher description',
      type: 'percentage',
      value: 10,
      startDate: new Date(),
      endDate: new Date(),
    };

    it('should create voucher successfully', async () => {
      const mockVoucher = { id: '1', ...createDto };
      vouchersService.create.mockResolvedValue(mockVoucher as any);

      const result = await controller.create(storeId, createDto as any);

      expect(vouchersService.create).toHaveBeenCalledWith(storeId, createDto);
      expect(result).toEqual(mockVoucher);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      vouchersService.create.mockRejectedValue(error);

      await expect(
        controller.create(storeId, createDto as any),
      ).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    const storeId = 'test-store-123';

    it('should find all vouchers successfully', async () => {
      const mockVouchers = [{ id: '1', code: 'VOUCHER123' }];
      vouchersService.findAll.mockResolvedValue(mockVouchers as any);

      const result = await controller.findAll(storeId);

      expect(vouchersService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockVouchers);
    });
  });
});
