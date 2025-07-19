import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockTransferItemsController } from 'src/modules/stock-transfer-items/controller/stock-transfer-items.controller';
import { StockTransferItemsService } from 'src/modules/stock-transfer-items/service/stock-transfer-items.service';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stock-transfer-item.dto';
import { UpdateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/update-stock-transfer-item.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('StockTransferItemsController', () => {
  let controller: StockTransferItemsController;
  let service: jest.Mocked<StockTransferItemsService>;

  const mockStockTransferItem = {
    stock_transfer_item_id: 'item-123',
    stock_transfer_id: 'transfer-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 15,
    unit_price: 40000,
    total_price: 600000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  };

  const mockUser: RequestWithUser = {
    user: { id: 'user-123', username: 'testuser', role: 'STORE_STAFF' },
  } as RequestWithUser;

  const mockCreateDto: CreateStockTransferItemDto = {
    stock_transfer_id: 'transfer-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 15,
    unit_price: 40000,
    total_price: 600000,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByStockTransferId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockTransferItemsController],
      providers: [{ provide: StockTransferItemsService, useValue: mockService }],
    }).compile();

    controller = module.get<StockTransferItemsController>(StockTransferItemsController);
    service = module.get(StockTransferItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a stock transfer item successfully', async () => {
      service.create.mockResolvedValue(mockStockTransferItem);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockStockTransferItem);
    });
  });

  describe('findAll', () => {
    it('should return all stock transfer items', async () => {
      service.findAll.mockResolvedValue([mockStockTransferItem]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockStockTransferItem]);
    });
  });

  describe('findOne', () => {
    it('should return a stock transfer item by id', async () => {
      service.findOne.mockResolvedValue(mockStockTransferItem);

      const result = await controller.findOne('item-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('item-123', mockUser);
      expect(result).toEqual(mockStockTransferItem);
    });
  });

  describe('update', () => {
    it('should update a stock transfer item successfully', async () => {
      const updateDto = { quantity: 20 };
      const updatedItem = { ...mockStockTransferItem, ...updateDto };
      service.update.mockResolvedValue(updatedItem);

      const result = await controller.update('item-123', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('item-123', updateDto, mockUser);
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should remove a stock transfer item successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('item-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('item-123', mockUser);
    });
  });

  describe('findByStockTransferId', () => {
    it('should return items by stock transfer id', async () => {
      service.findByStockTransferId.mockResolvedValue([mockStockTransferItem]);

      const result = await controller.findByStockTransferId('transfer-123', mockUser);

      expect(service.findByStockTransferId).toHaveBeenCalledWith('transfer-123', mockUser);
      expect(result).toEqual([mockStockTransferItem]);
    });
  });
});
