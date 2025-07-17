import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersController } from 'src/modules/orders/controller/orders.controller';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { CreateOrderAtomicDto } from 'src/modules/orders/dto/create-order-atomic.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { OrderStatus } from 'src/entities/tenant/order.entity';
import { RequestWithUser } from 'src/common/types/common.types';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: jest.Mocked<OrdersService>;

  // Mock data
  const mockOrder = {
    order_id: 'order-123',
    order_code: 'ORD-001',
    customer_id: 'customer-123',
    status: OrderStatus.PENDING,
    total_amount: 100000,
    total_paid: 100000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    orderItems: [
      {
        product_id: 'product-123',
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 50000,
        total_price: 100000,
      },
    ],
  };

  const mockOrders = [mockOrder];

  const mockUser: RequestWithUser = {
    user: {
      id: 'user-123',
      username: 'testuser',
      role: 'STORE_STAFF',
    },
  } as RequestWithUser;

  beforeEach(async () => {
    const mockOrdersService = {
      createOrder: jest.fn(),
      createOrderAtomic: jest.fn(),
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
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        customer_id: 'customer-123',
        orderItems: [
          {
            product_id: 'product-123',
            product_name: 'Test Product',
            quantity: 2,
            unit_price: 50000,
          },
        ],
      };

      ordersService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.create('store-123', createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(ordersService.createOrder).toHaveBeenCalledWith(
        'store-123',
        createOrderDto,
      );
    });

    it('should handle createOrder service errors', async () => {
      const createOrderDto: CreateOrderDto = {
        customer_id: 'customer-123',
        orderItems: [],
      };

      ordersService.createOrder.mockRejectedValue(
        new BadRequestException('Order must have at least one item'),
      );

      await expect(
        controller.create('store-123', createOrderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createOrderAtomic', () => {
    it('should create atomic order successfully', async () => {
      const createOrderAtomicDto: CreateOrderAtomicDto = {
        customer_id: 'customer-123',
        paymentMethodId: 'payment-123',
        orderItems: [
          {
            product_id: 'product-123',
            product_name: 'Test Product',
            quantity: 2,
            unit_price: 50000,
          },
        ],
      };

      ordersService.createOrderAtomic.mockResolvedValue(mockOrder);

      const result = await controller.createOrderAtomic(
        'store-123',
        createOrderAtomicDto,
        mockUser,
      );

      expect(result).toEqual(mockOrder);
      expect(ordersService.createOrderAtomic).toHaveBeenCalledWith(
        'store-123',
        {
          customer_id: 'customer-123',
          orderItems: createOrderAtomicDto.orderItems,
        },
        'user-123',
        'payment-123',
      );
    });

    it('should handle createOrderAtomic service errors', async () => {
      const createOrderAtomicDto: CreateOrderAtomicDto = {
        customer_id: 'customer-123',
        paymentMethodId: 'payment-123',
        orderItems: [],
      };

      ordersService.createOrderAtomic.mockRejectedValue(
        new BadRequestException('Insufficient inventory'),
      );

      await expect(
        controller.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      ordersService.findAllOrder.mockResolvedValue(mockOrders);

      const result = await controller.findAll('store-123');

      expect(result).toEqual(mockOrders);
      expect(ordersService.findAllOrder).toHaveBeenCalledWith('store-123');
    });

    it('should return empty array when no orders found', async () => {
      ordersService.findAllOrder.mockResolvedValue([]);

      const result = await controller.findAll('store-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      ordersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne('store-123', 'order-123');

      expect(result).toEqual(mockOrder);
      expect(ordersService.findOne).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle order not found', async () => {
      ordersService.findOne.mockRejectedValue(
        new BadRequestException('Order not found'),
      );

      await expect(
        controller.findOne('store-123', 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update order successfully', async () => {
      const updateOrderDto: UpdateOrderDto = {
        customer_id: 'customer-456',
        orderCode: 'ORD-001',
      };

      const updatedOrder = { ...mockOrder, customer_id: 'customer-456' };
      ordersService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(
        'store-123',
        'order-123',
        updateOrderDto,
      );

      expect(result).toEqual(updatedOrder);
      expect(ordersService.update).toHaveBeenCalledWith(
        'store-123',
        'order-123',
        updateOrderDto,
      );
    });

    it('should handle update service errors', async () => {
      const updateOrderDto: UpdateOrderDto = {
        customer_id: 'customer-456',
        orderCode: 'ORD-001',
      };

      ordersService.update.mockRejectedValue(
        new BadRequestException('Order cannot be updated'),
      );

      await expect(
        controller.update('store-123', 'order-123', updateOrderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      const removeResult = { message: 'Order deleted successfully' };
      ordersService.remove.mockResolvedValue(removeResult);

      const result = await controller.remove('store-123', 'order-123');

      expect(result).toEqual(removeResult);
      expect(ordersService.remove).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle remove service errors', async () => {
      ordersService.remove.mockRejectedValue(
        new BadRequestException('Order not found'),
      );

      await expect(
        controller.remove('store-123', 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('should restore order successfully', async () => {
      const restoreResult = { message: 'Order restored successfully' };
      ordersService.restore.mockResolvedValue(restoreResult);

      const result = await controller.restore('store-123', 'order-123');

      expect(result).toEqual(restoreResult);
      expect(ordersService.restore).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle restore service errors', async () => {
      ordersService.restore.mockRejectedValue(
        new BadRequestException('Order not found or not deleted'),
      );

      await expect(
        controller.restore('store-123', 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      ordersService.confirmOrder.mockResolvedValue(confirmedOrder);

      const result = await controller.confirmOrder('store-123', 'order-123');

      expect(result).toEqual(confirmedOrder);
      expect(ordersService.confirmOrder).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle confirm order service errors', async () => {
      ordersService.confirmOrder.mockRejectedValue(
        new BadRequestException('Order cannot be confirmed'),
      );

      await expect(
        controller.confirmOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('shipOrder', () => {
    it('should ship order successfully', async () => {
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      ordersService.shipOrder.mockResolvedValue(shippedOrder);

      const result = await controller.shipOrder('store-123', 'order-123');

      expect(result).toEqual(shippedOrder);
      expect(ordersService.shipOrder).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle ship order service errors', async () => {
      ordersService.shipOrder.mockRejectedValue(
        new BadRequestException('Order cannot be shipped'),
      );

      await expect(
        controller.shipOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      ordersService.completeOrder.mockResolvedValue(completedOrder);

      const result = await controller.completeOrder('store-123', 'order-123');

      expect(result).toEqual(completedOrder);
      expect(ordersService.completeOrder).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle complete order service errors', async () => {
      ordersService.completeOrder.mockRejectedValue(
        new BadRequestException('Order cannot be completed'),
      );

      await expect(
        controller.completeOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      ordersService.cancelOrder.mockResolvedValue(cancelledOrder);

      const result = await controller.cancelOrder('store-123', 'order-123');

      expect(result).toEqual(cancelledOrder);
      expect(ordersService.cancelOrder).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should handle cancel order service errors', async () => {
      ordersService.cancelOrder.mockRejectedValue(
        new BadRequestException('Order cannot be cancelled'),
      );

      await expect(
        controller.cancelOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const pendingOrders = [mockOrder];
      ordersService.findByStatus.mockResolvedValue(pendingOrders);

      const result = await controller.findByStatus('store-123', 'PENDING');

      expect(result).toEqual(pendingOrders);
      expect(ordersService.findByStatus).toHaveBeenCalledWith(
        'store-123',
        OrderStatus.PENDING,
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        controller.findByStatus('store-123', 'INVALID_STATUS'),
      ).rejects.toThrow(BadRequestException);

      expect(ordersService.findByStatus).not.toHaveBeenCalled();
    });
  });

  describe('findByCustomer', () => {
    it('should return orders by customer', async () => {
      const customerOrders = [mockOrder];
      ordersService.findByCustomer.mockResolvedValue(customerOrders);

      const result = await controller.findByCustomer(
        'store-123',
        'customer-123',
      );

      expect(result).toEqual(customerOrders);
      expect(ordersService.findByCustomer).toHaveBeenCalledWith(
        'store-123',
        'customer-123',
      );
    });

    it('should return empty array when customer has no orders', async () => {
      ordersService.findByCustomer.mockResolvedValue([]);

      const result = await controller.findByCustomer(
        'store-123',
        'customer-123',
      );

      expect(result).toEqual([]);
    });
  });
});
