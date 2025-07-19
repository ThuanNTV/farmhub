import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryTransferItemsController } from 'src/modules/inventory-transfer-items/controller/inventory-transfer-items.controller';
import { InventoryTransferItemsService } from 'src/modules/inventory-transfer-items/service/inventory-transfer-items.service';
import { CreateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/create-inventory-transfer-item.dto';
import { UpdateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/update-inventory-transfer-item.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('InventoryTransferItemsController', () => {
  let controller: InventoryTransferItemsController;
  let service: jest.Mocked<InventoryTransferItemsService>;

  // Mock data
  const mockInventoryTransferItem = {
    inventory_transfer_item_id: 'item-123',
    inventory_transfer_id: 'transfer-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 20,
    unit_price: 30000,
    total_price: 600000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  };

  const mockInventoryTransferItems = [mockInventoryTransferItem];

  const mockUser: RequestWithUser = {
    user: {
      id: 'user-123',
      username: 'testuser',
      role: 'STORE_STAFF',
    },
  } as RequestWithUser;

  const mockCreateDto: CreateInventoryTransferItemDto = {
    inventory_transfer_id: 'transfer-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 20,
    unit_price: 30000,
    total_price: 600000,
  };

  const mockUpdateDto: UpdateInventoryTransferItemDto = {
    quantity: 25,
    unit_price: 32000,
    total_price: 800000,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByInventoryTransferId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryTransferItemsController],
      providers: [
        {
          provide: InventoryTransferItemsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InventoryTransferItemsController>(
      InventoryTransferItemsController,
    );
    service = module.get(InventoryTransferItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an inventory transfer item successfully', async () => {
      service.create.mockResolvedValue(mockInventoryTransferItem);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockInventoryTransferItem);
    });

    it('should throw BadRequestException when creation fails', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all inventory transfer items', async () => {
      service.findAll.mockResolvedValue(mockInventoryTransferItems);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockInventoryTransferItems);
    });
  });

  describe('findOne', () => {
    it('should return an inventory transfer item by id', async () => {
      service.findOne.mockResolvedValue(mockInventoryTransferItem);

      const result = await controller.findOne('item-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('item-123', mockUser);
      expect(result).toEqual(mockInventoryTransferItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Item not found'),
      );

      await expect(controller.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an inventory transfer item successfully', async () => {
      const updatedItem = { ...mockInventoryTransferItem, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedItem);

      const result = await controller.update(
        'item-123',
        mockUpdateDto,
        mockUser,
      );

      expect(service.update).toHaveBeenCalledWith(
        'item-123',
        mockUpdateDto,
        mockUser,
      );
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException when updating non-existent item', async () => {
      service.update.mockRejectedValue(new NotFoundException('Item not found'));

      await expect(
        controller.update('nonexistent', mockUpdateDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an inventory transfer item successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('item-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('item-123', mockUser);
    });

    it('should throw NotFoundException when removing non-existent item', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Item not found'));

      await expect(controller.remove('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByInventoryTransferId', () => {
    it('should return items by inventory transfer id', async () => {
      service.findByInventoryTransferId.mockResolvedValue(
        mockInventoryTransferItems,
      );

      const result = await controller.findByInventoryTransferId(
        'transfer-123',
        mockUser,
      );

      expect(service.findByInventoryTransferId).toHaveBeenCalledWith(
        'transfer-123',
        mockUser,
      );
      expect(result).toEqual(mockInventoryTransferItems);
    });
  });
});
