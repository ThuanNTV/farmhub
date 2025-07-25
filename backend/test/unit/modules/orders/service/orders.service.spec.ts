/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../../../../../src/modules/orders/service/orders.service';
import { ProductsService } from '../../../../../src/modules/products/service/products.service';
import { InventoryTransfersService } from '../../../../../src/modules/inventory-transfers/service/inventory-transfers.service';
import { CreateOrderDto } from '../../../../../src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from '@modules/orders/dto/update-order.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { PaymentTransactionService } from 'src/modules/payments/service';
import { AuditTransactionService } from 'src/modules/audit-logs/service';
import { Order, OrderStatus } from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockProductsService: jest.Mocked<ProductsService>;
  let _mockInventoryTransfersService: jest.Mocked<InventoryTransfersService>;
  let _mockPaymentTransactionService: jest.Mocked<PaymentTransactionService>;
  let _mockAuditTransactionService: jest.Mocked<AuditTransactionService>;
  let mockRepository: jest.Mocked<any>;

  const mockOrderItem: OrderItem = {
    orderItemId: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    productId: '123e4567-e89b-12d3-a456-426614174002',
    productName: 'Test Product',
    productUnitId: '123e4567-e89b-12d3-a456-426614174003',
    quantity: 2,
    unitPrice: 100.0,
    totalPrice: 200.0,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: undefined as any,
    product: undefined as any,
  };

  const mockOrder: Order = {
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    orderCode: 'ORD001',
    customerId: '123e4567-e89b-12d3-a456-426614174004',
    totalAmount: 200.0,
    totalPaid: 200.0,
    vatAmount: 0,
    status: OrderStatus.PENDING,
    deliveryAddress: 'Test Address',
    deliveryStatus: undefined as any,
    debtStatus: undefined as any,
    isCreditOrder: false,
    note: 'Test Notes',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [mockOrderItem],
  };

  const mockProduct = {
    productId: '123e4567-e89b-12d3-a456-426614174002',
    product_id: '123e4567-e89b-12d3-a456-426614174002',
    productCode: 'TEST-001',
    product_code: 'TEST-001',
    name: 'Test Product',
    slug: 'test-product',
    description: 'This is a test product',
    priceRetail: 100.0,
    price_retail: 100.0,
    createdAt: new Date(),
    created_at: new Date(),
    updatedAt: new Date(),
    updated_at: new Date(),
    categoryId: '123e4567-e89b-12d3-a456-426614174005',
    category_id: '123e4567-e89b-12d3-a456-426614174005',
    category: undefined as any,
    stock: 10,
    unitId: '123e4567-e89b-12d3-a456-426614174006',
    unit_id: '123e4567-e89b-12d3-a456-426614174006',
    unit: undefined as any,
    minStockLevel: 5,
    min_stock_level: 5,
    isActive: true,
    is_active: true,
    isDeleted: false,
    is_deleted: false,
    getUnit: jest.fn(),
    getCreatedByUser: jest.fn(),
    getUpdatedByUser: jest.fn(),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn(),
    } as any;

    mockProductsService = {
      findById: jest.fn(),
    } as any;

    _mockInventoryTransfersService = {
      createTransfer: jest.fn(),
      updateInventoryForOrder: jest.fn(),
    } as any;

    _mockPaymentTransactionService = {
      createPaymentTransaction: jest.fn(),
      updatePaymentTransaction: jest.fn(),
    } as any;

    _mockAuditTransactionService = {
      logTransaction: jest.fn(),
      createAuditLog: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: InventoryTransfersService,
          useValue: _mockInventoryTransfersService,
        },
        {
          provide: PaymentTransactionService,
          useValue: _mockPaymentTransactionService,
        },
        {
          provide: AuditTransactionService,
          useValue: _mockAuditTransactionService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    // Setup default mocks
    const mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      isInitialized: true, // Thêm thuộc tính này để tránh lỗi "chưa được khởi tạo"
    };
    mockTenantDataSourceService.getTenantDataSource.mockResolvedValue(
      mockDataSource as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto & { orderItems?: any[] } = {
      orderCode: 'ORD001',
      customerId: '123e4567-e89b-12d3-a456-426614174004',
      totalAmount: 200.0,
      discountAmount: 0,
      shippingFee: 0,
      vatAmount: 0,
      status: OrderStatus.PENDING,
      deliveryAddress: 'Test Address',
      note: 'Test Notes',
      orderItems: [
        {
          productId: '123e4567-e89b-12d3-a456-426614174002',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 100.0,
          price: 200.0,
        },
      ],
    };

    it('should create an order successfully', async () => {
      const storeId = 'store-123';

      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);
      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.createOrder(storeId, createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw error if order has no items', async () => {
      const storeId = 'store-123';
      const dtoWithoutItems = { ...createOrderDto, orderItems: [] };

      await expect(
        service.createOrder(storeId, dtoWithoutItems),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if item has no product ID', async () => {
      const storeId = 'store-123';
      const dtoWithInvalidItem = {
        ...createOrderDto,
        orderItems: [
          {
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 100.0,
            price: 200.0,
          },
        ],
      };

      await expect(
        service.createOrder(storeId, dtoWithInvalidItem),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if item has invalid quantity', async () => {
      const storeId = 'store-123';
      const dtoWithInvalidQty = {
        ...createOrderDto,
        orderItems: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            productName: 'Test Product',
            quantity: 0,
            unitPrice: 100.0,
            price: 0,
          },
        ],
      };

      await expect(
        service.createOrder(storeId, dtoWithInvalidQty),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if item has invalid unit price', async () => {
      const storeId = 'store-123';
      const dtoWithInvalidPrice = {
        ...createOrderDto,
        orderItems: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 0,
            price: 0,
          },
        ],
      };

      await expect(
        service.createOrder(storeId, dtoWithInvalidPrice),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate total amount correctly', async () => {
      const storeId = 'store-123';
      const dtoWithItems = {
        ...createOrderDto,
        totalAmount: 300.0,
        orderItems: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            productName: 'Test Product',
            quantity: 3,
            unitPrice: 100.0,
            price: 300.0,
          },
        ],
      };

      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);
      mockRepository.findOne.mockResolvedValue(mockOrder);

      await service.createOrder(storeId, dtoWithItems);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 300.0,
        }),
      );
    });

    it('should calculate total paid with discount and shipping', async () => {
      const storeId = 'store-123';
      const dtoWithDiscountAndShipping = {
        ...createOrderDto,
        discountAmount: 20.0,
        shippingFee: 10.0,
        orderItems: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 100.0,
            price: 200.0,
          },
        ],
      };

      mockRepository.create.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);
      mockRepository.findOne.mockResolvedValue(mockOrder);

      await service.createOrder(storeId, dtoWithDiscountAndShipping);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPaid: 190.0, // 200 - 20 + 10
        }),
      );
    });
  });

  describe('findAllOrder', () => {
    it('should return all orders', async () => {
      const storeId = 'store-123';
      const orders = [mockOrder];

      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findAllOrder(storeId);

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false },
        relations: ['orderItems'],
      });
    });
  });

  describe('findOne', () => {
    it('should return order by ID', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(storeId, orderId);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { orderId, isDeleted: false },
        relations: ['orderItems'],
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(storeId, orderId)).rejects.toThrow(
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
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.merge.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.update(storeId, orderId, updateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockOrder,
        updateOrderDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw error if order not found', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(storeId, orderId, updateOrderDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle order items update', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const dtoWithItems = {
        ...updateOrderDto,
        orderItems: [
          {
            productId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 3,
            unitPrice: 100.0,
            price: 300.0,
          },
        ],
      };

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockProductsService.findById.mockResolvedValue(mockProduct);
      mockRepository.merge.mockReturnValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.update(storeId, orderId, dtoWithItems);

      expect(result).toEqual(mockOrder);
      expect(mockProductsService.findById).toHaveBeenCalledWith(
        storeId,
        '123e4567-e89b-12d3-a456-426614174002',
      );
    });

    it('should throw error if product not found during update', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const dtoWithItems = {
        ...updateOrderDto,
        orderItems: [
          {
            productId: 'invalid-product-id',
            quantity: 3,
            unitPrice: 100.0,
            price: 300.0,
          },
        ],
      };

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockProductsService.findById.mockResolvedValue(null);

      await expect(
        service.update(storeId, orderId, dtoWithItems),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should soft delete order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.remove(storeId, orderId);

      expect(result).toEqual({
        message: 'Xóa đơn hàng thành công',
        data: null,
      });
      expect(mockOrder.isDeleted).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('restore', () => {
    it('should restore order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';
      const deletedOrder = { ...mockOrder, isDeleted: true };

      mockRepository.findOne.mockResolvedValue(deletedOrder);
      mockRepository.save.mockResolvedValue(deletedOrder);

      const result = await service.restore(storeId, orderId);

      expect(result).toEqual({
        message: 'Khôi phục đơn hàng thành công',
        data: deletedOrder,
      });
      expect(deletedOrder.isDeleted).toBe(false);
      expect(mockRepository.save).toHaveBeenCalledWith(deletedOrder);
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.confirmOrder(storeId, orderId);

      expect(result).toEqual({
        message: 'Xác nhận đơn hàng thành công',
        data: mockOrder,
      });
      expect(mockOrder.status).toBe(OrderStatus.CONFIRMED);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('shipOrder', () => {
    it('should ship order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.shipOrder(storeId, orderId);

      expect(result).toEqual({
        message: 'Giao hàng thành công',
        data: mockOrder,
      });
      expect(mockOrder.status).toBe(OrderStatus.SHIPPED);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('completeOrder', () => {
    it('should complete order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockOrder.status = OrderStatus.SHIPPED;
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.completeOrder(storeId, orderId);

      expect(result).toEqual({
        message: 'Hoàn thành đơn hàng thành công',
        data: mockOrder,
      });
      expect(mockOrder.status).toBe(OrderStatus.DELIVERED);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const storeId = 'store-123';
      const orderId = '123e4567-e89b-12d3-a456-426614174001';

      mockOrder.status = OrderStatus.PENDING;
      mockRepository.findOne.mockResolvedValue(mockOrder);
      mockRepository.save.mockResolvedValue(mockOrder);

      const result = await service.cancelOrder(storeId, orderId);

      expect(result).toEqual({
        message: 'Hủy đơn hàng thành công',
        data: mockOrder,
      });
      expect(mockOrder.status).toBe(OrderStatus.CANCELLED);
      expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      const storeId = 'store-123';
      const status = OrderStatus.PENDING;
      const orders = [mockOrder];

      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findByStatus(storeId, status);

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status, isDeleted: false },
        relations: ['orderItems'],
      });
    });
  });

  describe('findByCustomer', () => {
    it('should return orders by customer ID', async () => {
      const storeId = 'store-123';
      const customerId = '123e4567-e89b-12d3-a456-426614174004';
      const orders = [mockOrder];

      mockRepository.find.mockResolvedValue(orders);

      const result = await service.findByCustomer(storeId, customerId);

      expect(result).toEqual(orders);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { customerId, isDeleted: false },
        relations: ['orderItems'],
      });
    });
  });
});
