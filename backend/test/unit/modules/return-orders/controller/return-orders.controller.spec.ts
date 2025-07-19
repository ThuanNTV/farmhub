import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ReturnOrdersController } from '@modules/return-orders/controller/return-orders.controller';
import { ReturnOrdersService } from 'src/modules/return-orders/service/return-orders.service';
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

describe('ReturnOrdersController', () => {
  let controller: ReturnOrdersController;
  let returnOrdersService: jest.Mocked<ReturnOrdersService>;

  const mockReturnOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnOrdersController],
      providers: [
        { provide: ReturnOrdersService, useValue: mockReturnOrdersService },
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

    controller = module.get<ReturnOrdersController>(ReturnOrdersController);
    returnOrdersService =
      module.get<jest.Mocked<ReturnOrdersService>>(ReturnOrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create return order successfully', async () => {
      const storeId = 'test-store-123';
      const createDto = {
        orderId: 'order-123',
        reason: 'Defective product',
        items: [],
      };
      const mockReturnOrder = { id: '1', ...createDto };
      returnOrdersService.create.mockResolvedValue(mockReturnOrder as any);

      const result = await controller.create(storeId, createDto as any);

      expect(returnOrdersService.create).toHaveBeenCalledWith(
        storeId,
        createDto,
      );
      expect(result).toEqual(mockReturnOrder);
    });
  });

  describe('findAll', () => {
    it('should return all return orders', async () => {
      const storeId = 'test-store-123';
      const mockReturnOrders = [
        { id: '1', orderId: 'order-123', reason: 'Defective' },
      ];
      returnOrdersService.findAll.mockResolvedValue(mockReturnOrders as any);

      const result = await controller.findAll(storeId);

      expect(returnOrdersService.findAll).toHaveBeenCalledWith(storeId);
      expect(result).toEqual(mockReturnOrders);
    });
  });

  describe('remove', () => {
    it('should remove return order successfully', async () => {
      const storeId = 'test-store-123';
      const id = 'return-order-123';
      const mockResult = { message: 'Return order deleted successfully' };
      returnOrdersService.remove.mockResolvedValue(mockResult as any);

      const result = await controller.remove(storeId, id);

      expect(returnOrdersService.remove).toHaveBeenCalledWith(storeId, id);
      expect(result).toEqual(mockResult);
    });
  });
});
