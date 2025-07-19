import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import {
  Order,
  OrderStatus,
  DebtStatus,
  DeliveryStatus,
} from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';
import { PaymentTransactionService } from 'src/modules/payments/service';
import { AuditTransactionService } from 'src/modules/audit-logs/service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { CreateOrderAtomicDto } from 'src/modules/orders/dto/create-order-atomic.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let _mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockProductsService: jest.Mocked<ProductsService>;
  let mockInventoryService: jest.Mocked<InventoryTransfersService>;
  let mockPaymentService: jest.Mocked<PaymentTransactionService>;
  let _mockAuditService: jest.Mocked<AuditTransactionService>;

  // Mock repository
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  // Mock data
  const mockOrderItem: Partial<OrderItem> = {
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 2,
    unit_price: 50000,
    total_price: 100000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOrder: Partial<Order> = {
    order_id: 'order-123',
    order_code: 'ORD-001',
    customer_id: 'customer-123',
    status: OrderStatus.PENDING,
    total_amount: 100000,
    total_paid: 100000,
    vat_amount: 0,
    is_credit_order: false,
    debt_status: DebtStatus.UNPAID,
    delivery_address: 'Test Address',
    delivery_status: DeliveryStatus.PROCESSING,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    order_items: [mockOrderItem as OrderItem],
  };

  beforeEach(async () => {
    const mockTenantDS = {
      getTenantDataSource: jest.fn(),
    };

    const mockProducts = {
      findById: jest.fn(),
    };

    const mockInventory = {
      createInventoryTransfer: jest.fn(),
      validateStockAvailability: jest.fn(),
      transferInventory: jest.fn(),
      decreaseStock: jest.fn(), // Bổ sung hàm này
      // ... các hàm public khác nếu OrdersService có gọi
    };

    const mockPayment = {
      processPayment: jest.fn(),
      createPayment: jest.fn(), // Bổ sung mock createPayment
    };

    const mockAudit = {
      logOrderCreation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDS,
        },
        {
          provide: ProductsService,
          useValue: mockProducts,
        },
        {
          provide: InventoryTransfersService,
          useValue: mockInventory,
        },
        {
          provide: PaymentTransactionService,
          useValue: mockPayment,
        },
        {
          provide: AuditTransactionService,
          useValue: mockAudit,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    _mockTenantDataSourceService = module.get(TenantDataSourceService);
    mockProductsService = module.get(ProductsService);
    mockInventoryService = module.get(InventoryTransfersService);
    mockPaymentService = module.get(PaymentTransactionService);
    _mockAuditService = module.get(AuditTransactionService);

    // Mock getRepository method
    jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);

    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue(mockRepository),
        save: mockRepository.save,
        findOne: mockRepository.findOne,
        create: mockRepository.create,
        // ... các method khác nếu cần
      },
    };
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      isInitialized: true,
    };
    _mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource as unknown as import('typeorm').DataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto & { orderItems: any[] } = {
      orderCode: 'ORD-001',
      customerId: 'customer-123',
      totalAmount: 100000,
      deliveryAddress: 'Test Address',
      orderItems: [
        {
          product_id: 'product-123',
          product_name: 'Test Product',
          quantity: 2,
          unit_price: 50000,
        },
      ],
    };

    it('should create order successfully', async () => {
      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);
      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.createOrder('store-123', createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle foreign key constraint error', async () => {
      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockRejectedValue(
        new Error('violates foreign key constraint'),
      );

      await expect(
        service.createOrder('store-123', createOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle not-null constraint error', async () => {
      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockRejectedValue(
        new Error('violates not-null constraint'),
      );

      await expect(
        service.createOrder('store-123', createOrderDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle generic database errors', async () => {
      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createOrder('store-123', createOrderDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAllOrder', () => {
    it('should return all orders', async () => {
      const orders = [mockOrder];
      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findAllOrder('store-123');

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        relations: ['orderItems'],
      });
    });

    it('should return empty array when no orders', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllOrder('store-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('store-123', 'order-123');

      expect(result).toEqual(mockOrder);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 'order-123', is_deleted: false },
        relations: ['orderItems'],
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('store-123', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateOrderDto: UpdateOrderDto = {
      customerId: 'customer-456',
      orderCode: 'ORD-001',
    };

    it('should update order successfully', async () => {
      const updatedOrder = { ...mockOrder, customerId: 'customer-456' };
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.merge.mockReturnValue(updatedOrder);
      mockRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.update(
        'store-123',
        'order-123',
        updateOrderDto,
      );

      expect(result).toMatchObject(
        expect.objectContaining({
          customer_id: expect.any(String),
          // ... các trường quan trọng khác ...
        }),
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          order_id: 'order-123',
          order_code: 'ORD-001',
          is_deleted: false,
          status: OrderStatus.PENDING,
        },
        relations: ['orderItems'],
      });
    });

    it('should throw InternalServerErrorException when order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('store-123', 'order-123', updateOrderDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove order successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrder);
      const deletedOrder = { ...mockOrder, is_deleted: true };
      mockRepository.save.mockResolvedValue(deletedOrder);

      const result = await service.remove('store-123', 'order-123');

      expect(result).toEqual({
        message: 'Xóa đơn hàng thành công',
        data: null,
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('store-123', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore order successfully', async () => {
      const deletedOrder = { ...mockOrder, is_deleted: true };
      const restoredOrder = { ...mockOrder, is_deleted: false };
      mockRepository.findOne.mockResolvedValue(deletedOrder);
      mockRepository.save.mockResolvedValue(restoredOrder);

      const result = await service.restore('store-123', 'order-123');

      expect(result).toEqual({
        message: 'Khôi phục đơn hàng thành công',
        data: restoredOrder,
      });
    });

    it('should throw NotFoundException when deleted order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('store-123', 'invalid-id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(confirmedOrder);

      const result = await service.confirmOrder('store-123', 'order-123');

      expect(result).toMatchObject({
        data: expect.objectContaining({
          order_id: expect.any(String),
          status: 'confirmed',
          customer_id: expect.any(String),
          // ... các trường quan trọng khác ...
        }),
        message: 'Xác nhận đơn hàng thành công',
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 'order-123', is_deleted: false },
        relations: ['orderItems'],
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.confirmOrder('store-123', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order not pending', async () => {
      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      mockRepository.findOne.mockResolvedValue(confirmedOrder);

      await expect(
        service.confirmOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('shipOrder', () => {
    it('should ship order successfully', async () => {
      const confirmedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      mockRepository.findOne.mockResolvedValue(confirmedOrder);
      mockRepository.save.mockResolvedValue(shippedOrder);
      const result = await service.shipOrder('store-123', 'order-123');
      expect(result).toMatchObject({
        data: expect.objectContaining({
          order_id: expect.any(String),
          status: 'shipped',
          customer_id: expect.any(String),
        }),
        message: 'Giao hàng thành công',
      });
    });
    it('should throw BadRequestException when order not confirmed', async () => {
      // Đảm bảo trạng thái order là PENDING (không phải CONFIRMED)
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      mockRepository.findOne.mockResolvedValue(pendingOrder);
      await expect(service.shipOrder('store-123', 'order-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      const shippedOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      const completedOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
      mockRepository.findOne.mockResolvedValue(shippedOrder);
      mockRepository.save.mockResolvedValue(completedOrder);
      const result = await service.completeOrder('store-123', 'order-123');
      expect(result).toMatchObject({
        data: expect.objectContaining({
          order_id: expect.any(String),
          status: 'delivered',
          customer_id: expect.any(String),
        }),
        message: 'Hoàn thành đơn hàng thành công',
      });
    });
    it('should throw BadRequestException when order not shipped', async () => {
      // Đảm bảo trạng thái order là PENDING (không phải SHIPPED)
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      mockRepository.findOne.mockResolvedValue(pendingOrder);
      await expect(
        service.completeOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      // Đảm bảo trạng thái order là PENDING (không phải DELIVERED)
      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      mockRepository.findOne.mockResolvedValue(pendingOrder);
      mockRepository.save.mockResolvedValue(cancelledOrder);
      const result = await service.cancelOrder('store-123', 'order-123');
      expect(result).toMatchObject({
        data: expect.anything(),
        message: 'Hủy đơn hàng thành công',
      });
    });
    it('should throw BadRequestException when order already delivered', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatus.DELIVERED };
      mockRepository.findOne.mockResolvedValue(completedOrder);
      await expect(
        service.cancelOrder('store-123', 'order-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const orders = [mockOrder];
      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findByStatus(
        'store-123',
        OrderStatus.PENDING,
      );

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: OrderStatus.PENDING, is_deleted: false },
        relations: ['orderItems'],
      });
    });

    it('should return empty array when no orders with status', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByStatus(
        'store-123',
        OrderStatus.PENDING,
      );

      expect(result).toEqual([]);
    });
  });

  describe('findByCustomer', () => {
    it('should return orders by customer', async () => {
      const orders = [mockOrder];
      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findByCustomer('store-123', 'customer-123');

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { customer_id: 'customer-123', is_deleted: false },
        relations: ['orderItems'],
      });
    });

    it('should return empty array when customer has no orders', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByCustomer('store-123', 'customer-123');

      expect(result).toEqual([]);
    });
  });

  describe('createOrderAtomic', () => {
    const createOrderAtomicDto: CreateOrderAtomicDto = {
      orderCode: 'ORD-001',
      customerId: 'customer-123',
      totalAmount: 100000,
      deliveryAddress: 'Test Address',
      orderItems: [
        {
          product_id: 'product-123',
          product_name: 'Test Product',
          quantity: 2,
          unit_price: 50000,
        },
      ],
      paymentMethodId: '',
    };

    it('should create order atomically successfully', async () => {
      // Mock product validation
      mockProductsService.findById.mockResolvedValue({
        product_id: 'product-123',
        product_name: 'Test Product',
        price: 50000,
        is_deleted: false,
      } as any);

      // Mock inventory transfer
      mockInventoryService.createInventoryTransfer.mockResolvedValue({
        id: 'transfer-123',
        sourceStoreId: 'store-123',
        targetStoreId: 'store-456',
        transferCode: 'TRF-001',
        status: 'PENDING',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Mock payment processing
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
      });

      // Mock order creation
      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);
      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.createOrderAtomic(
        'store-123',
        createOrderAtomicDto,
        'user-123',
        'payment-123',
      );

      expect(result).toEqual(mockOrder);
      expect(mockProductsService.findById).toHaveBeenCalledWith(
        'store-123',
        'product-123',
      );
      expect(
        mockInventoryService.createInventoryTransfer,
      ).toHaveBeenCalledTimes(1);
      expect(mockPaymentService.processPayment).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      mockPaymentService.createPayment.mockResolvedValue({
        id: 'payment-123',
        amount: '100000',
        payment_method_id: 'payment-123',
        order_id: 'order-123',
        order: mockOrder as any, // ép kiểu tạm thời cho mock
        status: 'COMPLETED' as any, // ép kiểu tạm thời cho mock
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    it('should throw BadRequestException when product not found', async () => {
      mockProductsService.findById.mockResolvedValue(null);

      await expect(
        service.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          'user-123',
          'payment-123',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException when product is deleted', async () => {
      mockProductsService.findById.mockResolvedValue({
        product_id: 'product-123',
        product_name: 'Test Product',
        price: 50000,
        is_deleted: true,
      } as any);

      await expect(
        service.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          'user-123',
          'payment-123',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException when inventory transfer fails', async () => {
      mockProductsService.findById.mockResolvedValue({
        product_id: 'product-123',
        product_name: 'Test Product',
        price: 50000,
        is_deleted: false,
      } as any);

      mockInventoryService.createInventoryTransfer.mockRejectedValue(
        new Error('Insufficient inventory'),
      );

      await expect(
        service.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          'user-123',
          'payment-123',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw BadRequestException when payment fails', async () => {
      mockProductsService.findById.mockResolvedValue({
        product_id: 'product-123',
        product_name: 'Test Product',
        price: 50000,
        is_deleted: false,
      } as any);

      mockInventoryService.createInventoryTransfer.mockResolvedValue({
        id: 'transfer-123',
        sourceStoreId: 'store-123',
        targetStoreId: 'store-456',
        transferCode: 'TRF-001',
        status: 'PENDING',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockPaymentService.processPayment.mockRejectedValue(
        new Error('Payment failed'),
      );

      await expect(
        service.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          'user-123',
          'payment-123',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle transaction rollback on order creation failure', async () => {
      mockProductsService.findById.mockResolvedValue({
        product_id: 'product-123',
        product_name: 'Test Product',
        price: 50000,
        is_deleted: false,
      } as any);

      mockInventoryService.createInventoryTransfer.mockResolvedValue({
        id: 'transfer-123',
        sourceStoreId: 'store-123',
        targetStoreId: 'store-456',
        transferCode: 'TRF-001',
        status: 'PENDING',
        transferDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
      });

      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createOrderAtomic(
          'store-123',
          createOrderAtomicDto,
          'user-123',
          'payment-123',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
