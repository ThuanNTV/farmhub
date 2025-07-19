import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsController } from '@modules/order-items/controller/order-items.controller';
import { OrderItemsService } from '@modules/order-items/service/order-items.service';
import { CreateOrderItemDto } from '@modules/order-items/dto/create-orderItem.dto';
import { UpdateOrderItemDto } from '@modules/order-items/dto/update-orderItem.dto';
import { OrderItemResponseDto } from '@modules/order-items/dto/orderItem-response.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';
import { PermissionGuard } from '@core/rbac/permission/permission.guard';
import { AuditInterceptor } from '@common/auth/audit.interceptor';

describe('OrderItemsController', () => {
  let controller: OrderItemsController;
  let service: jest.Mocked<OrderItemsService>;
  let module: TestingModule;

  // Mock data
  const mockOrderItem: OrderItemResponseDto = {
    orderItemId: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    productId: '123e4567-e89b-12d3-a456-426614174002',
    productName: 'Test Product',
    productUnitId: '123e4567-e89b-12d3-a456-426614174003',
    quantity: 2,
    unitPrice: 100.0,
    totalPrice: 200.0,
    note: 'Test note',
    isDeleted: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    createdByUserId: '123e4567-e89b-12d3-a456-426614174004',
    updatedByUserId: '123e4567-e89b-12d3-a456-426614174004',
  };

  const mockCreateDto: CreateOrderItemDto = {
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    productId: '123e4567-e89b-12d3-a456-426614174002',
    productName: 'Test Product',
    productUnitId: '123e4567-e89b-12d3-a456-426614174003',
    quantity: 2,
    unitPrice: 100.0,
    totalPrice: 200.0,
    note: 'Test note',
  };

  const mockUpdateDto: UpdateOrderItemDto = {
    quantity: 3,
    unitPrice: 120.0,
    totalPrice: 360.0,
    note: 'Updated note',
  };

  const mockRequest = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174004',
      email: 'test@example.com',
    },
  };

  const storeId = 'store-123';

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      createOrderItem: jest.fn(),
      findAllOrderItems: jest.fn(),
      findByOrder: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    };

    // Create mock guard
    const mockGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [OrderItemsController],
      providers: [
        {
          provide: OrderItemsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<OrderItemsController>(OrderItemsController);
    service = module.get<jest.Mocked<OrderItemsService>>(OrderItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('create', () => {
    it('should create an order item successfully', async () => {
      service.createOrderItem.mockResolvedValue(mockOrderItem);

      const result = await controller.create(
        storeId,
        mockCreateDto,
        mockRequest as any,
      );

      expect(result).toEqual(mockOrderItem);
      expect(service.createOrderItem).toHaveBeenCalledWith(
        storeId,
        mockCreateDto,
        mockRequest.user.id,
      );
    });

    it('should handle duplicate order item conflict', async () => {
      service.createOrderItem.mockRejectedValue(
        new ConflictException(
          'Order item with this order and product already exists',
        ),
      );

      await expect(
        controller.create(storeId, mockCreateDto, mockRequest as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle invalid foreign key references', async () => {
      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Order with ID order-123 not found'),
      );

      await expect(
        controller.create(storeId, mockCreateDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle validation errors', async () => {
      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Quantity must be a positive number'),
      );

      await expect(
        controller.create(storeId, mockCreateDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all order items', async () => {
      const mockOrderItems = [mockOrderItem];
      service.findAllOrderItems.mockResolvedValue(mockOrderItems);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(mockOrderItems);
      expect(service.findAllOrderItems).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty results', async () => {
      service.findAllOrderItems.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAllOrderItems.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByOrder', () => {
    const orderId = 'order-123';

    it('should return order items for specific order', async () => {
      const mockOrderItems = [mockOrderItem];
      service.findByOrder.mockResolvedValue(mockOrderItems);

      const result = await controller.findByOrder(storeId, orderId);

      expect(result).toEqual(mockOrderItems);
      expect(service.findByOrder).toHaveBeenCalledWith(storeId, orderId);
    });

    it('should handle empty results for order', async () => {
      service.findByOrder.mockResolvedValue([]);

      const result = await controller.findByOrder(storeId, orderId);

      expect(result).toEqual([]);
    });

    it('should handle invalid order ID', async () => {
      service.findByOrder.mockRejectedValue(
        new BadRequestException('Invalid order ID format'),
      );

      await expect(
        controller.findByOrder(storeId, 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    const orderItemId = 'order-item-123';

    it('should return order item by ID', async () => {
      service.findOne.mockResolvedValue(mockOrderItem);

      const result = await controller.findOne(storeId, orderItemId);

      expect(result).toEqual(mockOrderItem);
      expect(service.findOne).toHaveBeenCalledWith(storeId, orderItemId);
    });

    it('should handle order item not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Order item with ID "order-item-123" not found'),
      );

      await expect(controller.findOne(storeId, orderItemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const orderItemId = 'order-item-123';

    it('should update order item successfully', async () => {
      const updatedOrderItem = { ...mockOrderItem, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedOrderItem);

      const result = await controller.update(
        storeId,
        orderItemId,
        mockUpdateDto,
        mockRequest as any,
      );

      expect(result).toEqual(updatedOrderItem);
      expect(service.update).toHaveBeenCalledWith(
        storeId,
        orderItemId,
        mockUpdateDto,
        mockRequest.user.id,
      );
    });

    it('should handle update validation errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Unit price must be a positive number'),
      );

      await expect(
        controller.update(
          storeId,
          orderItemId,
          mockUpdateDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle order item not found during update', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Order item with ID "order-item-123" not found'),
      );

      await expect(
        controller.update(
          storeId,
          orderItemId,
          mockUpdateDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle conflict during update', async () => {
      service.update.mockRejectedValue(
        new ConflictException(
          'Order item with this order and product already exists',
        ),
      );

      await expect(
        controller.update(
          storeId,
          orderItemId,
          mockUpdateDto,
          mockRequest as any,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    const orderItemId = 'order-item-123';

    it('should remove order item successfully', async () => {
      const removeResponse = { message: 'Order item deleted successfully' };
      service.remove.mockResolvedValue(removeResponse);

      const result = await controller.remove(
        storeId,
        orderItemId,
        mockRequest as any,
      );

      expect(result).toEqual(removeResponse);
      expect(service.remove).toHaveBeenCalledWith(
        storeId,
        orderItemId,
        mockRequest.user.id,
      );
    });

    it('should handle remove errors', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Order item with ID "order-item-123" not found'),
      );

      await expect(
        controller.remove(storeId, orderItemId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    const orderItemId = 'order-item-123';

    it('should restore order item successfully', async () => {
      service.restore.mockResolvedValue(mockOrderItem);

      const result = await controller.restore(
        storeId,
        orderItemId,
        mockRequest as any,
      );

      expect(result).toEqual(mockOrderItem);
      expect(service.restore).toHaveBeenCalledWith(
        storeId,
        orderItemId,
        mockRequest.user.id,
      );
    });

    it('should handle restore errors', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException('Order item not found or not deleted'),
      );

      await expect(
        controller.restore(storeId, orderItemId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('business logic validation', () => {
    it('should handle negative quantity', async () => {
      const invalidDto = {
        ...mockCreateDto,
        quantity: -1,
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Quantity must be a positive number'),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative unit price', async () => {
      const invalidDto = {
        ...mockCreateDto,
        unitPrice: -100,
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Unit price must be a positive number'),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle negative total price', async () => {
      const invalidDto = {
        ...mockCreateDto,
        totalPrice: -200,
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Total price must be a positive number'),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle non-existent product', async () => {
      const invalidDto = {
        ...mockCreateDto,
        productId: 'non-existent-product-id',
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException(
          'Product with ID non-existent-product-id not found',
        ),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle non-existent order', async () => {
      const invalidDto = {
        ...mockCreateDto,
        orderId: 'non-existent-order-id',
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException(
          'Order with ID non-existent-order-id not found',
        ),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('edge cases', () => {
    it('should handle empty store ID', async () => {
      service.findAllOrderItems.mockRejectedValue(
        new BadRequestException('Store ID is required'),
      );

      await expect(controller.findAll('')).rejects.toThrow(BadRequestException);
    });

    it('should handle malformed UUID', async () => {
      service.findOne.mockRejectedValue(
        new BadRequestException('Invalid UUID format'),
      );

      await expect(controller.findOne(storeId, 'invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service unavailable', async () => {
      service.findAllOrderItems.mockRejectedValue(
        new InternalServerErrorException('Service temporarily unavailable'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle zero quantity', async () => {
      const invalidDto = {
        ...mockCreateDto,
        quantity: 0,
      };

      service.createOrderItem.mockRejectedValue(
        new BadRequestException('Quantity must be a positive number'),
      );

      await expect(
        controller.create(storeId, invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle very large quantities', async () => {
      const largeQuantityDto = {
        ...mockCreateDto,
        quantity: 999999999,
      };

      service.createOrderItem.mockResolvedValue({
        ...mockOrderItem,
        quantity: 999999999,
      });

      const result = await controller.create(
        storeId,
        largeQuantityDto,
        mockRequest as any,
      );

      expect(result.quantity).toBe(999999999);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete order item lifecycle', async () => {
      const orderItemId = 'order-item-123';

      // Create
      service.createOrderItem.mockResolvedValue(mockOrderItem);
      const created = await controller.create(
        storeId,
        mockCreateDto,
        mockRequest as any,
      );
      expect(created).toEqual(mockOrderItem);

      // Read
      service.findOne.mockResolvedValue(mockOrderItem);
      const found = await controller.findOne(storeId, orderItemId);
      expect(found).toEqual(mockOrderItem);

      // Update
      const updatedOrderItem = { ...mockOrderItem, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedOrderItem);
      const updated = await controller.update(
        storeId,
        orderItemId,
        mockUpdateDto,
        mockRequest as any,
      );
      expect(updated).toEqual(updatedOrderItem);

      // Delete
      const removeResponse = { message: 'Order item deleted successfully' };
      service.remove.mockResolvedValue(removeResponse);
      const removed = await controller.remove(
        storeId,
        orderItemId,
        mockRequest as any,
      );
      expect(removed).toEqual(removeResponse);

      // Restore
      service.restore.mockResolvedValue(mockOrderItem);
      const restored = await controller.restore(
        storeId,
        orderItemId,
        mockRequest as any,
      );
      expect(restored).toEqual(mockOrderItem);
    });

    it('should handle multiple order items for same order', async () => {
      const orderId = 'order-123';
      const multipleOrderItems = [
        mockOrderItem,
        { ...mockOrderItem, orderItemId: 'item-2', productId: 'product-2' },
        { ...mockOrderItem, orderItemId: 'item-3', productId: 'product-3' },
      ];

      service.findByOrder.mockResolvedValue(multipleOrderItems);

      const result = await controller.findByOrder(storeId, orderId);

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleOrderItems);
    });
  });
});
