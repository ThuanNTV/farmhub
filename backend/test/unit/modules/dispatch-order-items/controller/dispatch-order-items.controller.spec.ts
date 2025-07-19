/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DispatchOrderItemsController } from '@modules/dispatch-order-items/controller/dispatch-order-items.controller';
import { DispatchOrderItemsService } from '@modules/dispatch-order-items/service/dispatch-order-items.service';
import { CreateDispatchOrderItemDto } from '@modules/dispatch-order-items/dto/create-dispatchOrderItem.dto';
import { UpdateDispatchOrderItemDto } from '@modules/dispatch-order-items/dto/update-dispatchOrderItem.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';

describe('DispatchOrderItemsController', () => {
  let controller: DispatchOrderItemsController;
  let service: jest.Mocked<DispatchOrderItemsService>;
  let module: TestingModule;

  // Mock data
  const mockDispatchOrderItemEntity = {
    id: 'dispatch-item-123',
    dispatch_order_id: 'dispatch-order-123',
    product_id: 'product-123',
    quantity: 10,
    unit_price: '25.50',
    total_price: '255.00',
    created_by_user_id: 'user-123',
    updated_by_user_id: 'user-123',
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    is_deleted: false,
    // Mock relations
    dispatch_order: {
      id: 'dispatch-order-123',
      order_number: 'DO-001',
    } as any,
    product: {
      id: 'product-123',
      name: 'Test Product',
      product_code: 'P001',
    } as any,
  };

  const mockCreateDto: CreateDispatchOrderItemDto = {
    dispatchOrderId: 'dispatch-order-123',
    productId: 'product-123',
    quantity: 10,
    unitPrice: '25.50',
  };

  const mockUpdateDto: UpdateDispatchOrderItemDto = {
    quantity: 15,
    unitPrice: '30.00',
  };

  const storeId = 'store-123';
  const dispatchOrderItemId = 'dispatch-item-123';

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Create mock guard
    const mockGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [DispatchOrderItemsController],
      providers: [
        {
          provide: DispatchOrderItemsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<DispatchOrderItemsController>(
      DispatchOrderItemsController,
    );
    service = module.get<jest.Mocked<DispatchOrderItemsService>>(
      DispatchOrderItemsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a dispatch order item successfully', async () => {
      service.create.mockResolvedValue(mockDispatchOrderItemEntity);

      const result = await controller.create(storeId, mockCreateDto);

      expect(result).toEqual(mockDispatchOrderItemEntity);
      expect(service.create).toHaveBeenCalledWith(storeId, mockCreateDto);
    });

    it('should handle creation errors', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid dispatch order item data'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid dispatch order ID', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Dispatch order not found'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle invalid product ID', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all dispatch order items', async () => {
      const mockItems = [mockDispatchOrderItemEntity];
      service.findAll.mockResolvedValue(mockItems);

      const result = await controller.findAll(storeId);

      expect(result).toEqual(mockItems);
      expect(service.findAll).toHaveBeenCalledWith(storeId);
    });

    it('should handle empty results', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(storeId);

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findById', () => {
    it('should return dispatch order item by ID', async () => {
      service.findOne.mockResolvedValue(mockDispatchOrderItemEntity);

      const result = await controller.findById(storeId, dispatchOrderItemId);

      expect(result).toEqual(mockDispatchOrderItemEntity);
      expect(service.findOne).toHaveBeenCalledWith(
        storeId,
        dispatchOrderItemId,
      );
    });

    it('should handle item not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException(
          'Dispatch order item with ID "dispatch-item-123" not found',
        ),
      );

      await expect(
        controller.findById(storeId, dispatchOrderItemId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dispatch order item successfully', async () => {
      const updatedItem = { ...mockDispatchOrderItemEntity, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedItem);

      const result = await controller.update(
        storeId,
        dispatchOrderItemId,
        mockUpdateDto,
      );

      expect(result).toEqual(updatedItem);
      expect(service.update).toHaveBeenCalledWith(
        storeId,
        dispatchOrderItemId,
        mockUpdateDto,
      );
    });

    it('should handle update validation errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Invalid update data'),
      );

      await expect(
        controller.update(storeId, dispatchOrderItemId, mockUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle item not found during update', async () => {
      service.update.mockRejectedValue(
        new NotFoundException(
          'Dispatch order item with ID "dispatch-item-123" not found',
        ),
      );

      await expect(
        controller.update(storeId, dispatchOrderItemId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove dispatch order item successfully', async () => {
      const removeResponse = {
        message:
          '✅ Dispatch order item với ID "dispatch-item-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);

      const result = await controller.remove(storeId, dispatchOrderItemId);

      expect(result).toEqual(removeResponse);
      expect(service.remove).toHaveBeenCalledWith(storeId, dispatchOrderItemId);
    });

    it('should handle remove errors', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException(
          'Dispatch order item with ID "dispatch-item-123" not found',
        ),
      );

      await expect(
        controller.remove(storeId, dispatchOrderItemId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('business logic validation', () => {
    it('should handle zero quantity', async () => {
      const invalidDto = {
        ...mockCreateDto,
        quantity: 0,
      };

      service.create.mockRejectedValue(
        new BadRequestException('Quantity must be greater than 0'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle negative quantity', async () => {
      const invalidDto = {
        ...mockCreateDto,
        quantity: -5,
      };

      service.create.mockRejectedValue(
        new BadRequestException('Quantity cannot be negative'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid unit price format', async () => {
      const invalidDto = {
        ...mockCreateDto,
        unitPrice: 'invalid-price',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Invalid unit price format'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle negative unit price', async () => {
      const invalidDto = {
        ...mockCreateDto,
        unitPrice: '-10.50',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Unit price cannot be negative'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle very large quantity', async () => {
      const largeQuantityDto = {
        ...mockCreateDto,
        quantity: 999999,
      };

      const largeQuantityItem = {
        ...mockDispatchOrderItemEntity,
        quantity: 999999,
        total_price: '24999974.50',
      };
      service.create.mockResolvedValue(largeQuantityItem);

      const result = await controller.create(storeId, largeQuantityDto);

      expect(result.quantity).toBe(999999);
      expect(service.create).toHaveBeenCalledWith(storeId, largeQuantityDto);
    });

    it('should handle decimal unit price', async () => {
      const decimalPriceDto = {
        ...mockCreateDto,
        unitPrice: '25.999',
      };

      const decimalPriceItem = {
        ...mockDispatchOrderItemEntity,
        unit_price: '25.999',
        total_price: '259.99',
      };
      service.create.mockResolvedValue(decimalPriceItem);

      const result = await controller.create(storeId, decimalPriceDto);

      expect(result.unit_price).toBe('25.999');
      expect(service.create).toHaveBeenCalledWith(storeId, decimalPriceDto);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed store ID', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid store ID format'),
      );

      await expect(
        controller.create('invalid-store-id', mockCreateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle malformed dispatch order item ID', async () => {
      service.findOne.mockRejectedValue(
        new BadRequestException('Invalid dispatch order item ID format'),
      );

      await expect(controller.findById(storeId, 'invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service unavailable', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Service temporarily unavailable'),
      );

      await expect(controller.findAll(storeId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle concurrent updates', async () => {
      service.update.mockRejectedValue(
        new ConflictException(
          'Dispatch order item was modified by another user',
        ),
      );

      await expect(
        controller.update(storeId, dispatchOrderItemId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle dispatch order already dispatched', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Cannot add items to already dispatched order'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle insufficient product stock', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Insufficient product stock for dispatch'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete dispatch order item lifecycle', async () => {
      // Create
      service.create.mockResolvedValue(mockDispatchOrderItemEntity);
      const created = await controller.create(storeId, mockCreateDto);
      expect(created).toEqual(mockDispatchOrderItemEntity);

      // Read
      service.findOne.mockResolvedValue(mockDispatchOrderItemEntity);
      const found = await controller.findById(storeId, dispatchOrderItemId);
      expect(found).toEqual(mockDispatchOrderItemEntity);

      // Update
      const updatedItem = { ...mockDispatchOrderItemEntity, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedItem);
      const updated = await controller.update(
        storeId,
        dispatchOrderItemId,
        mockUpdateDto,
      );
      expect(updated).toEqual(updatedItem);

      // Delete
      const removeResponse = {
        message:
          '✅ Dispatch order item với ID "dispatch-item-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);
      const removed = await controller.remove(storeId, dispatchOrderItemId);
      expect(removed).toEqual(removeResponse);
    });

    it('should handle multiple dispatch order items', async () => {
      const multipleItems = [
        mockDispatchOrderItemEntity,
        {
          ...mockDispatchOrderItemEntity,
          id: 'item-2',
          product_id: 'product-2',
        },
        {
          ...mockDispatchOrderItemEntity,
          id: 'item-3',
          product_id: 'product-3',
        },
      ];

      service.findAll.mockResolvedValue(multipleItems);

      const result = await controller.findAll(storeId);

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleItems);
    });

    it('should handle store-specific dispatch order items', async () => {
      const store1Items = [mockDispatchOrderItemEntity];
      const store2Items = [
        {
          ...mockDispatchOrderItemEntity,
          id: 'item-2',
          dispatch_order_id: 'order-2',
        },
      ];

      // Test store 1
      service.findAll.mockResolvedValue(store1Items);
      const store1Result = await controller.findAll('store-1');
      expect(store1Result).toEqual(store1Items);

      // Test store 2
      service.findAll.mockResolvedValue(store2Items);
      const store2Result = await controller.findAll('store-2');
      expect(store2Result).toEqual(store2Items);

      expect(service.findAll).toHaveBeenCalledTimes(2);
      expect(service.findAll).toHaveBeenCalledWith('store-1');
      expect(service.findAll).toHaveBeenCalledWith('store-2');
    });

    it('should handle dispatch order with multiple products', async () => {
      const multipleProductItems = [
        { ...mockCreateDto, productId: 'product-1', quantity: 5 },
        { ...mockCreateDto, productId: 'product-2', quantity: 10 },
        { ...mockCreateDto, productId: 'product-3', quantity: 15 },
      ];

      for (const item of multipleProductItems) {
        const itemEntity = {
          ...mockDispatchOrderItemEntity,
          product_id: item.productId,
          quantity: item.quantity,
        };

        service.create.mockResolvedValue(itemEntity);

        const result = await controller.create(storeId, item);
        expect(result.product_id).toBe(item.productId);
        expect(result.quantity).toBe(item.quantity);
      }

      expect(service.create).toHaveBeenCalledTimes(multipleProductItems.length);
    });
  });
});
