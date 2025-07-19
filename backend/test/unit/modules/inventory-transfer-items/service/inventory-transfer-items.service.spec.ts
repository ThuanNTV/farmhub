import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryTransferItemsService } from 'src/modules/inventory-transfer-items/service/inventory-transfer-items.service';
import { InventoryTransferItem } from 'src/entities/tenant/inventoryTransferItem.entity';
import { CreateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/create-inventory-transfer-item.dto';
import { UpdateInventoryTransferItemDto } from 'src/modules/inventory-transfer-items/dto/update-inventory-transfer-item.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('InventoryTransferItemsService', () => {
  let service: InventoryTransferItemsService;
  let repository: jest.Mocked<Repository<InventoryTransferItem>>;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;

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
  } as InventoryTransferItem;

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
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockTenantDataSourceService = {
      getTenantRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTransferItemsService,
        {
          provide: getRepositoryToken(InventoryTransferItem),
          useValue: mockRepository,
        },
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<InventoryTransferItemsService>(InventoryTransferItemsService);
    repository = module.get(getRepositoryToken(InventoryTransferItem));
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an inventory transfer item successfully', async () => {
      repository.create.mockReturnValue(mockInventoryTransferItem);
      repository.save.mockResolvedValue(mockInventoryTransferItem);

      const result = await service.create(mockCreateDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(repository.save).toHaveBeenCalledWith(mockInventoryTransferItem);
      expect(result).toEqual(mockInventoryTransferItem);
    });

    it('should throw BadRequestException when save fails', async () => {
      repository.create.mockReturnValue(mockInventoryTransferItem);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all inventory transfer items', async () => {
      const mockItems = [mockInventoryTransferItem];
      repository.find.mockResolvedValue(mockItems);

      const result = await service.findAll(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockItems);
    });
  });

  describe('findOne', () => {
    it('should return an inventory transfer item by id', async () => {
      repository.findOne.mockResolvedValue(mockInventoryTransferItem);

      const result = await service.findOne('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { inventory_transfer_item_id: 'item-123', is_deleted: false },
      });
      expect(result).toEqual(mockInventoryTransferItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an inventory transfer item successfully', async () => {
      repository.findOne.mockResolvedValue(mockInventoryTransferItem);
      const updatedItem = { ...mockInventoryTransferItem, ...mockUpdateDto };
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-123', mockUpdateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { inventory_transfer_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', mockUpdateDto, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete an inventory transfer item successfully', async () => {
      repository.findOne.mockResolvedValue(mockInventoryTransferItem);
      repository.save.mockResolvedValue({ ...mockInventoryTransferItem, is_deleted: true });

      await service.remove('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { inventory_transfer_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockInventoryTransferItem,
        is_deleted: true,
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByInventoryTransferId', () => {
    it('should return items by inventory transfer id', async () => {
      const mockItems = [mockInventoryTransferItem];
      repository.find.mockResolvedValue(mockItems);

      const result = await service.findByInventoryTransferId('transfer-123', mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { inventory_transfer_id: 'transfer-123', is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockItems);
    });
  });
});
