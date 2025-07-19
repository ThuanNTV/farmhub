import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RecreateOrderController } from 'src/modules/recreate-order/controller/recreate-order.controller';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { SecurityService } from 'src/service/global/security.service';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import {
  DebtStatus,
  OrderStatus,
  DeliveryStatus,
} from 'src/entities/tenant/order.entity';
import {
  mockSecurityService,
  mockAuditLogAsyncService,
  mockReflector,
  mockOrdersService,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
} from '../../../../utils/mock-dependencies';

describe('RecreateOrderController', () => {
  let controller: RecreateOrderController;
  let ordersService: jest.Mocked<OrdersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreateOrderController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockEnhancedAuthGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .compile();

    controller = module.get<RecreateOrderController>(RecreateOrderController);
    ordersService = module.get<jest.Mocked<OrdersService>>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('recreateOrder', () => {
    const storeId = 'test-store-123';
    const orderId = 'test-order-123';
    const mockRecreatedOrder = {
      orderId: 'new-order-123',
      orderCode: 'ORD002',
      customerId: 'customer-123',
      totalAmount: 100,
      status: OrderStatus.PENDING,
      items: [],
      isCreditOrder: false,
      debtStatus: DebtStatus.UNPAID,
      vatAmount: 0,
      totalPaid: 0,
      isDeleted: false,
      deliveryAddress: '',
      deliveryStatus: DeliveryStatus.PROCESSING,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderItems: [],
    };

    it('should recreate order successfully', async () => {
      ordersService.recreateOrder.mockResolvedValue(mockRecreatedOrder as any);

      const result = await controller.recreateOrder(storeId, orderId);

      expect(ordersService.recreateOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
      );
      expect(result).toEqual({ ...mockRecreatedOrder, items: [] });
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      ordersService.recreateOrder.mockRejectedValue(error);

      await expect(controller.recreateOrder(storeId, orderId)).rejects.toThrow(
        'Service error',
      );
      expect(ordersService.recreateOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
      );
    });
  });
});
