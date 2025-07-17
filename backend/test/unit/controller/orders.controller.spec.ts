import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../../src/modules/orders/controller/orders.controller';
import { OrdersService } from '../../../src/modules/orders/service/orders.service';
import { CreateOrderDto } from '../../../src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from '../../../src/modules/orders/dto/update-order.dto';
import { Order, OrderStatus } from '../../../src/entities/tenant/order.entity';
import { OrderItem } from '../../../src/entities/tenant/orderItem.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from 'src/entities/tenant/product.entity';
import { Reflector } from '@nestjs/core';
import { SecurityService } from 'src/service/global/security.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let mockOrdersService: jest.Mocked<OrdersService>;

  const mockOrderItem: OrderItem = {
    order_item_id: '123e4567-e89b-12d3-a456-426614174000',
    order_id: '123e4567-e89b-12d3-a456-426614174001',
    product_id: '123e4567-e89b-12d3-a456-426614174002',
    product_name: 'Test Product',
    product_unit_id: '123e4567-e89b-12d3-a456-426614174003',
    quantity: 2,
    unit_price: 100.0,
    total_price: 200.0,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    order: undefined as any,
    product: undefined as any,
  };

  const mockOrder: Order = {
    order_id: '123e4567-e89b-12d3-a456-426614174001',
    order_code: 'ORD001',
    customer_id: '123e4567-e89b-12d3-a456-426614174004',
    total_amount: 200.0,
    total_paid: 200.0,
    vat_amount: 0,
    status: OrderStatus.PENDING,
    debt_status: undefined as any,
    delivery_status: undefined as any,
    delivery_address: 'Test Address',
    is_credit_order: false,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    order_items: [mockOrderItem],
  };

  const storeId = 'store-123';

  const mockRequest = {
    user: {
      userId: '123e4567-e89b-12d3-a456-426614174001',
      storeId: 'store-123',
    },
  };

  beforeEach(async () => {
    mockOrdersService = {
      createOrder: jest.fn(),
      findAllOrder: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      confirmOrder: jest.fn(),
      shipOrder: jest.fn(),
      completeOrder: jest.fn(),
      cancelOrder: jest.fn(),
      findByStatus: jest.fn(),
      findByCustomer: jest.fn(),
      recreateOrder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        {
          provide: EnhancedAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: PermissionGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        { provide: AuditInterceptor, useValue: { intercept: jest.fn() } },
        { provide: SecurityService, useValue: {} },
        { provide: Reflector, useValue: {} },
        { provide: AuditLogsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      orderCode: 'ORD001',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      totalAmount: 200.0,
      discountAmount: 0,
      shippingFee: 0,
      vatAmount: 0,
      status: OrderStatus.PENDING,
      deliveryAddress: 'Test Address',
    };

    it('should create an order successfully', async () => {
      mockOrdersService.createOrder.mockResolvedValue(mockOrder);
      const result = await controller.create(storeId, createOrderDto);
      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.createOrder).toHaveBeenCalledWith(
        storeId,
        createOrderDto,
      );
    });

    it('should handle service errors', async () => {
      mockOrdersService.createOrder.mockRejectedValue(
        new InternalServerErrorException('Order creation failed'),
      );

      await expect(controller.create(storeId, createOrderDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      mockOrdersService.findAllOrder.mockResolvedValue(orders);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(orders);
      expect(mockOrdersService.findAllOrder).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty results', async () => {
      mockOrdersService.findAllOrder.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return order by ID', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(storeId, orderId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(storeId, orderId);
    });

    it('should handle order not found', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.findOne.mockRejectedValue(
        new NotFoundException('Order not found'),
      );

      await expect(controller.findOne(storeId, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateOrderDto: UpdateOrderDto = {
      orderCode: 'ORD001',
      status: OrderStatus.CONFIRMED,
      note: 'Updated Notes',
    };

    it('should update order successfully', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.update.mockResolvedValue(mockOrder);

      const result = await controller.update(storeId, orderId, updateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        storeId,
        orderId,
        updateOrderDto,
      );
    });

    it('should handle update errors', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.update.mockRejectedValue(
        new InternalServerErrorException('Update failed'),
      );

      await expect(
        controller.update(storeId, orderId, updateOrderDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedResponse = {
        message: 'Order deleted successfully',
        data: null,
      };

      mockOrdersService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(storeId, orderId);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.remove).toHaveBeenCalledWith(storeId, orderId);
    });

    it('should handle remove errors', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.remove.mockRejectedValue(
        new InternalServerErrorException('Cannot delete order'),
      );

      await expect(controller.remove(storeId, orderId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedResponse = {
        message: 'Order confirmed successfully',
        data: mockOrder,
      };

      mockOrdersService.confirmOrder.mockResolvedValue(expectedResponse);

      const result = await controller.confirmOrder(storeId, orderId);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.confirmOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
      );
    });

    it('should handle confirm errors', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.confirmOrder.mockRejectedValue(
        new InternalServerErrorException('Cannot confirm order'),
      );

      await expect(controller.confirmOrder(storeId, orderId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedResponse = {
        message: 'Order completed successfully',
        data: mockOrder,
      };

      mockOrdersService.completeOrder.mockResolvedValue(expectedResponse);

      const result = await controller.completeOrder(storeId, orderId);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.completeOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
      );
    });

    it('should handle complete errors', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.completeOrder.mockRejectedValue(
        new InternalServerErrorException('Cannot complete order'),
      );

      await expect(controller.completeOrder(storeId, orderId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedResponse = {
        message: 'Order cancelled successfully',
        data: mockOrder,
      };

      mockOrdersService.cancelOrder.mockResolvedValue(expectedResponse);

      const result = await controller.cancelOrder(storeId, orderId);

      expect(result).toEqual(expectedResponse);
      expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(
        storeId,
        orderId,
      );
    });

    it('should handle cancel errors', async () => {
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      mockOrdersService.cancelOrder.mockRejectedValue(
        new InternalServerErrorException('Cannot cancel order'),
      );

      await expect(controller.cancelOrder(storeId, orderId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const status = 'PENDING';
      const orders = [mockOrder];
      mockOrdersService.findByStatus.mockResolvedValue(orders);

      const result = await controller.findByStatus(storeId, status);

      expect(result).toEqual(orders);
      expect(mockOrdersService.findByStatus).toHaveBeenCalledWith(
        storeId,
        OrderStatus[status as keyof typeof OrderStatus],
      );
    });

    it('should handle empty status results', async () => {
      const status = 'CANCELLED';
      mockOrdersService.findByStatus.mockResolvedValue([]);

      const result = await controller.findByStatus(storeId, status);

      expect(result).toEqual([]);
    });
  });

  describe('findByCustomer', () => {
    it('should return orders by customer ID', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174004';
      const orders = [mockOrder];
      mockOrdersService.findByCustomer.mockResolvedValue(orders);

      const result = await controller.findByCustomer(storeId, customerId);

      expect(result).toEqual(orders);
      expect(mockOrdersService.findByCustomer).toHaveBeenCalledWith(
        storeId,
        customerId,
      );
    });

    it('should handle empty customer results', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174004';
      mockOrdersService.findByCustomer.mockResolvedValue([]);

      const result = await controller.findByCustomer(storeId, customerId);

      expect(result).toEqual([]);
    });
  });
});
