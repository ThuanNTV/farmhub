/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryTransferItemsController } from '@modules/inventory-transfer-items/controller/inventory-transfer-items.controller';
import { InventoryTransferItemsService } from '@modules/inventory-transfer-items/service/inventory-transfer-items.service';
import { CreateInventoryTransferItemDto } from '@modules/inventory-transfer-items/dto/create-inventoryTransferItem.dto';
import { UpdateInventoryTransferItemDto } from '@modules/inventory-transfer-items/dto/update-inventoryTransferItem.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';

describe('InventoryTransferItemsController', () => {
  let controller: InventoryTransferItemsController;
  let service: jest.Mocked<InventoryTransferItemsService>;
  let module: TestingModule;

  // Mock data
  const mockInventoryTransferItemEntity = {
    id: 'transfer-item-123',
    transfer_id: 'transfer-123',
    product_id: 'product-123',
    quantity: 50,
    unit_price: 15.75,
    created_by_user_id: 'user-123',
    updated_by_user_id: 'user-123',
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    deleted_at: undefined,
    is_deleted: false,
  };

  const mockCreateDto: CreateInventoryTransferItemDto = {
    transferId: 'transfer-123',
    productId: 'product-123',
    quantity: 50,
    unitPrice: 15.75,
    createdByUserId: 'user-123',
  };

  const mockUpdateDto: UpdateInventoryTransferItemDto = {
    quantity: 75,
    unitPrice: 18.5,
  };

  const storeId = 'store-123';
  const transferItemId = 'transfer-item-123';

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      removeInventoryTransferItem: jest.fn(),
    };

    // Create mock guard
    const mockGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [InventoryTransferItemsController],
      providers: [
        {
          provide: InventoryTransferItemsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<InventoryTransferItemsController>(
      InventoryTransferItemsController,
    );
    service = module.get<jest.Mocked<InventoryTransferItemsService>>(
      InventoryTransferItemsService,
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
    it('should create an inventory transfer item successfully', async () => {
      service.create.mockResolvedValue(mockInventoryTransferItemEntity);

      const result = await controller.create(storeId, mockCreateDto);

      expect(result).toEqual(mockInventoryTransferItemEntity);
      expect(service.create).toHaveBeenCalledWith(storeId, mockCreateDto);
    });

    it('should handle creation errors', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid inventory transfer item data'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle invalid transfer ID', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Inventory transfer not found'),
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
    it('should return all inventory transfer items', async () => {
      const mockItems = [mockInventoryTransferItemEntity];
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

  describe('findOne', () => {
    it('should return inventory transfer item by ID', async () => {
      service.findOne.mockResolvedValue(mockInventoryTransferItemEntity);

      const result = await controller.findOne(storeId, transferItemId);

      expect(result).toEqual(mockInventoryTransferItemEntity);
      expect(service.findOne).toHaveBeenCalledWith(storeId, transferItemId);
    });

    it('should handle item not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException(
          'Inventory transfer item with ID "transfer-item-123" not found',
        ),
      );

      await expect(controller.findOne(storeId, transferItemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update inventory transfer item successfully', async () => {
      const updatedItem = {
        ...mockInventoryTransferItemEntity,
        ...mockUpdateDto,
      };
      service.update.mockResolvedValue(updatedItem);

      const result = await controller.update(
        storeId,
        transferItemId,
        mockUpdateDto,
      );

      expect(result).toEqual(updatedItem);
      expect(service.update).toHaveBeenCalledWith(
        storeId,
        transferItemId,
        mockUpdateDto,
      );
    });

    it('should handle update validation errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Invalid update data'),
      );

      await expect(
        controller.update(storeId, transferItemId, mockUpdateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle item not found during update', async () => {
      service.update.mockRejectedValue(
        new NotFoundException(
          'Inventory transfer item with ID "transfer-item-123" not found',
        ),
      );

      await expect(
        controller.update(storeId, transferItemId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove inventory transfer item successfully', async () => {
      const removeResponse = {
        message:
          '✅ Inventory transfer item với ID "transfer-item-123" đã được xóa mềm',
        data: null,
      };
      service.removeInventoryTransferItem.mockResolvedValue(removeResponse);

      const result = await controller.remove(storeId, transferItemId);

      expect(result).toEqual(removeResponse);
      expect(service.removeInventoryTransferItem).toHaveBeenCalledWith(
        transferItemId,
        storeId,
      );
    });

    it('should handle remove errors', async () => {
      service.removeInventoryTransferItem.mockRejectedValue(
        new NotFoundException(
          'Inventory transfer item with ID "transfer-item-123" not found',
        ),
      );

      await expect(controller.remove(storeId, transferItemId)).rejects.toThrow(
        NotFoundException,
      );
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
        quantity: -10,
      };

      service.create.mockRejectedValue(
        new BadRequestException('Quantity cannot be negative'),
      );

      await expect(controller.create(storeId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle negative unit price', async () => {
      const invalidDto = {
        ...mockCreateDto,
        unitPrice: -5.5,
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
        ...mockInventoryTransferItemEntity,
        quantity: 999999,
      };
      service.create.mockResolvedValue(largeQuantityItem);

      const result = await controller.create(storeId, largeQuantityDto);

      expect(result.quantity).toBe(999999);
      expect(service.create).toHaveBeenCalledWith(storeId, largeQuantityDto);
    });

    it('should handle decimal unit price', async () => {
      const decimalPriceDto = {
        ...mockCreateDto,
        unitPrice: 25.999,
      };

      const decimalPriceItem = {
        ...mockInventoryTransferItemEntity,
        unit_price: 25.999,
      };
      service.create.mockResolvedValue(decimalPriceItem);

      const result = await controller.create(storeId, decimalPriceDto);

      expect(result.unit_price).toBe(25.999);
      expect(service.create).toHaveBeenCalledWith(storeId, decimalPriceDto);
    });

    it('should handle optional unit price', async () => {
      const noPriceDto = {
        transferId: 'transfer-123',
        productId: 'product-123',
        quantity: 50,
        createdByUserId: 'user-123',
      };

      const noPriceItem = {
        ...mockInventoryTransferItemEntity,
        unit_price: undefined,
      };
      service.create.mockResolvedValue(noPriceItem);

      const result = await controller.create(storeId, noPriceDto);

      expect(result.unit_price).toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(storeId, noPriceDto);
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

    it('should handle malformed transfer item ID', async () => {
      service.findOne.mockRejectedValue(
        new BadRequestException('Invalid inventory transfer item ID format'),
      );

      await expect(controller.findOne(storeId, 'invalid-id')).rejects.toThrow(
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
          'Inventory transfer item was modified by another user',
        ),
      );

      await expect(
        controller.update(storeId, transferItemId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle transfer already completed', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Cannot add items to completed transfer'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle insufficient inventory', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Insufficient inventory for transfer'),
      );

      await expect(controller.create(storeId, mockCreateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete inventory transfer item lifecycle', async () => {
      // Create
      service.create.mockResolvedValue(mockInventoryTransferItemEntity);
      const created = await controller.create(storeId, mockCreateDto);
      expect(created).toEqual(mockInventoryTransferItemEntity);

      // Read
      service.findOne.mockResolvedValue(mockInventoryTransferItemEntity);
      const found = await controller.findOne(storeId, transferItemId);
      expect(found).toEqual(mockInventoryTransferItemEntity);

      // Update
      const updatedItem = {
        ...mockInventoryTransferItemEntity,
        ...mockUpdateDto,
      };
      service.update.mockResolvedValue(updatedItem);
      const updated = await controller.update(
        storeId,
        transferItemId,
        mockUpdateDto,
      );
      expect(updated).toEqual(updatedItem);

      // Delete
      const removeResponse = {
        message:
          '✅ Inventory transfer item với ID "transfer-item-123" đã được xóa mềm',
        data: null,
      };
      service.removeInventoryTransferItem.mockResolvedValue(removeResponse);
      const removed = await controller.remove(storeId, transferItemId);
      expect(removed).toEqual(removeResponse);
    });

    it('should handle multiple inventory transfer items', async () => {
      const multipleItems = [
        mockInventoryTransferItemEntity,
        {
          ...mockInventoryTransferItemEntity,
          id: 'item-2',
          product_id: 'product-2',
        },
        {
          ...mockInventoryTransferItemEntity,
          id: 'item-3',
          product_id: 'product-3',
        },
      ];

      service.findAll.mockResolvedValue(multipleItems);

      const result = await controller.findAll(storeId);

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleItems);
    });

    it('should handle store-specific inventory transfer items', async () => {
      const store1Items = [mockInventoryTransferItemEntity];
      const store2Items = [
        {
          ...mockInventoryTransferItemEntity,
          id: 'item-2',
          transfer_id: 'transfer-2',
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

    it('should handle transfer with multiple products', async () => {
      const multipleProductItems = [
        { ...mockCreateDto, productId: 'product-1', quantity: 25 },
        { ...mockCreateDto, productId: 'product-2', quantity: 50 },
        { ...mockCreateDto, productId: 'product-3', quantity: 75 },
      ];

      for (const item of multipleProductItems) {
        const itemEntity = {
          ...mockInventoryTransferItemEntity,
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

    it('should handle inventory transfer with different unit prices', async () => {
      const differentPriceItems = [
        { ...mockCreateDto, unitPrice: 10.5 },
        { ...mockCreateDto, unitPrice: 25.75 },
        { ...mockCreateDto, unitPrice: undefined }, // No price
      ];

      for (const item of differentPriceItems) {
        const itemEntity = {
          ...mockInventoryTransferItemEntity,
          unit_price: item.unitPrice,
        };

        service.create.mockResolvedValue(itemEntity);

        const result = await controller.create(storeId, item);
        if (item.unitPrice) {
          expect(result.unit_price).toBe(item.unitPrice);
        } else {
          expect(result.unit_price).toBeUndefined();
        }
      }

      expect(service.create).toHaveBeenCalledTimes(differentPriceItems.length);
    });

    it('should handle bulk quantity updates', async () => {
      const quantityUpdates = [
        { quantity: 100 },
        { quantity: 200 },
        { quantity: 300 },
      ];

      for (const update of quantityUpdates) {
        const updatedItem = {
          ...mockInventoryTransferItemEntity,
          quantity: update.quantity,
        };

        service.update.mockResolvedValue(updatedItem);

        const result = await controller.update(storeId, transferItemId, update);
        expect(result).toBeTruthy();
        expect(result!.quantity).toBe(update.quantity);
      }

      expect(service.update).toHaveBeenCalledTimes(quantityUpdates.length);
    });
  });
});
