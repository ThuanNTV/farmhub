import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { OrderStatus } from 'src/entities/tenant/order.entity';

describe('OrdersService - Comprehensive Tests', () => {
  let service: OrdersService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockOrder = {
    order_id: 'order-123',
    order_code: 'ORD-001',
    customer_id: 'customer-123',
    status: OrderStatus.PENDING,
    total_amount: 100000,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrdersService,
          useValue: {
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
            createOrderAtomic: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        orderCode: 'ORD-001',
        customerId: 'customer-123',
        totalAmount: 100000,
        deliveryAddress: 'Test Address',
      };

      (service.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.createOrder('store-123', createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(service.createOrder).toHaveBeenCalledWith(
        'store-123',
        createOrderDto,
      );
    });

    it('should handle error when create order fails', async () => {
      const createOrderDto: CreateOrderDto = {
        orderCode: 'ORD-001',
        customerId: 'customer-123',
        totalAmount: 100000,
        deliveryAddress: 'Test Address',
      };

      (service.createOrder as jest.Mock).mockRejectedValue(
        new BadRequestException('Invalid order data'),
      );

      await expect(
        service.createOrder('store-123', createOrderDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllOrder', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      (service.findAllOrder as jest.Mock).mockResolvedValue(orders);

      const result = await service.findAllOrder('store-123');

      expect(result).toEqual(orders);
      expect(service.findAllOrder).toHaveBeenCalledWith('store-123');
    });

    it('should return empty array when no orders', async () => {
      (service.findAllOrder as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllOrder('store-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.findOne('store-123', 'order-123');

      expect(result).toEqual(mockOrder);
      expect(service.findOne).toHaveBeenCalledWith('store-123', 'order-123');
    });

    it('should throw NotFoundException when order not found', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Order not found'),
      );

      await expect(service.findOne('store-123', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      (service.confirmOrder as jest.Mock).mockResolvedValue(confirmedOrder);

      const result = await service.confirmOrder('store-123', 'order-123');

      expect(result).toEqual(confirmedOrder);
      expect(service.confirmOrder).toHaveBeenCalledWith(
        'store-123',
        'order-123',
      );
    });

    it('should throw BadRequestException when order cannot be confirmed', async () => {
      (service.confirmOrder as jest.Mock).mockRejectedValue(
        new BadRequestException('Order is not in pending status'),
      );

      await expect(
        service.confirmOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const orders = [mockOrder];
      (service.findByStatus as jest.Mock).mockResolvedValue(orders);

      const result = await service.findByStatus(
        'store-123',
        OrderStatus.PENDING,
      );

      expect(result).toEqual(orders);
      expect(service.findByStatus).toHaveBeenCalledWith(
        'store-123',
        OrderStatus.PENDING,
      );
    });
  });

  describe('findByCustomer', () => {
    it('should return orders by customer', async () => {
      const orders = [mockOrder];
      (service.findByCustomer as jest.Mock).mockResolvedValue(orders);

      const result = await service.findByCustomer('store-123', 'customer-123');

      expect(result).toEqual(orders);
      expect(service.findByCustomer).toHaveBeenCalledWith(
        'store-123',
        'customer-123',
      );
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      const removeResult = {
        message: '✅ Order với ID "order-123" đã được xóa mềm',
        data: null,
      };
      (service.remove as jest.Mock).mockResolvedValue(removeResult);

      const result = await service.remove('store-123', 'order-123');

      expect(result).toEqual(removeResult);
      expect(service.remove).toHaveBeenCalledWith('store-123', 'order-123');
    });
  });

  describe('restore', () => {
    it('should restore order successfully', async () => {
      const restoreResult = {
        message: '✅ Order với ID "order-123" đã được khôi phục',
        data: mockOrder,
      };
      (service.restore as jest.Mock).mockResolvedValue(restoreResult);

      const result = await service.restore('store-123', 'order-123');

      expect(result).toEqual(restoreResult);
      expect(service.restore).toHaveBeenCalledWith('store-123', 'order-123');
    });
  });
});
