import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StockTransferItemsService } from 'src/modules/stock-transfer-items/service/stock-transfer-items.service';
import { StockTransferItem } from 'src/entities/tenant/stockTransferItem.entity';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stock-transfer-item.dto';
import { UpdateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/update-stock-transfer-item.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('StockTransferItemsService', () => {
  let service: StockTransferItemsService;
  let repository: jest.Mocked<Repository<StockTransferItem>>;

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
  } as StockTransferItem;

  const mockUser: RequestWithUser = {
    user: { id: 'user-123', username: 'testuser', role: 'STORE_STAFF' },
  } as RequestWithUser;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockTransferItemsService,
        { provide: getRepositoryToken(StockTransferItem), useValue: mockRepository },
        { provide: TenantDataSourceService, useValue: { getTenantRepository: jest.fn().mockReturnValue(mockRepository) } },
      ],
    }).compile();

    service = module.get<StockTransferItemsService>(StockTransferItemsService);
    repository = module.get(getRepositoryToken(StockTransferItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a stock transfer item successfully', async () => {
      repository.create.mockReturnValue(mockStockTransferItem);
      repository.save.mockResolvedValue(mockStockTransferItem);

      const createDto = {
        stock_transfer_id: 'transfer-123',
        product_id: 'product-123',
        product_name: 'Test Product',
        quantity: 15,
        unit_price: 40000,
        total_price: 600000,
      };

      const result = await service.create(createDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockStockTransferItem);
      expect(result).toEqual(mockStockTransferItem);
    });
  });

  describe('findAll', () => {
    it('should return all stock transfer items', async () => {
      repository.find.mockResolvedValue([mockStockTransferItem]);

      const result = await service.findAll(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockStockTransferItem]);
    });
  });

  describe('findOne', () => {
    it('should return a stock transfer item by id', async () => {
      repository.findOne.mockResolvedValue(mockStockTransferItem);

      const result = await service.findOne('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { stock_transfer_item_id: 'item-123', is_deleted: false },
      });
      expect(result).toEqual(mockStockTransferItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a stock transfer item successfully', async () => {
      repository.findOne.mockResolvedValue(mockStockTransferItem);
      const updateDto = { quantity: 20 };
      const updatedItem = { ...mockStockTransferItem, ...updateDto };
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-123', updateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { stock_transfer_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should soft delete a stock transfer item successfully', async () => {
      repository.findOne.mockResolvedValue(mockStockTransferItem);
      repository.save.mockResolvedValue({ ...mockStockTransferItem, is_deleted: true });

      await service.remove('item-123', mockUser);

      expect(repository.save).toHaveBeenCalledWith({
        ...mockStockTransferItem,
        is_deleted: true,
      });
    });
  });

  describe('findByStockTransferId', () => {
    it('should return items by stock transfer id', async () => {
      repository.find.mockResolvedValue([mockStockTransferItem]);

      const result = await service.findByStockTransferId('transfer-123', mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { stock_transfer_id: 'transfer-123', is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockStockTransferItem]);
    });
  });
});
