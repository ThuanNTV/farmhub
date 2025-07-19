import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ReturnOrderItemsService } from 'src/modules/return-order-items/service/return-order-items.service';
import { ReturnOrderItem } from 'src/entities/tenant/returnOrderItem.entity';
import { CreateReturnOrderItemDto } from 'src/modules/return-order-items/dto/create-return-order-item.dto';
import { UpdateReturnOrderItemDto } from 'src/modules/return-order-items/dto/update-return-order-item.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('ReturnOrderItemsService', () => {
  let service: ReturnOrderItemsService;
  let repository: jest.Mocked<Repository<ReturnOrderItem>>;

  const mockReturnOrderItem = {
    return_order_item_id: 'item-123',
    return_order_id: 'return-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 3,
    unit_price: 75000,
    total_price: 225000,
    return_reason: 'Defective product',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  } as ReturnOrderItem;

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
        ReturnOrderItemsService,
        { provide: getRepositoryToken(ReturnOrderItem), useValue: mockRepository },
        { provide: TenantDataSourceService, useValue: { getTenantRepository: jest.fn().mockReturnValue(mockRepository) } },
      ],
    }).compile();

    service = module.get<ReturnOrderItemsService>(ReturnOrderItemsService);
    repository = module.get(getRepositoryToken(ReturnOrderItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a return order item successfully', async () => {
      repository.create.mockReturnValue(mockReturnOrderItem);
      repository.save.mockResolvedValue(mockReturnOrderItem);

      const createDto = {
        return_order_id: 'return-123',
        product_id: 'product-123',
        product_name: 'Test Product',
        quantity: 3,
        unit_price: 75000,
        total_price: 225000,
        return_reason: 'Defective product',
      };

      const result = await service.create(createDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockReturnOrderItem);
      expect(result).toEqual(mockReturnOrderItem);
    });
  });

  describe('findAll', () => {
    it('should return all return order items', async () => {
      repository.find.mockResolvedValue([mockReturnOrderItem]);

      const result = await service.findAll(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockReturnOrderItem]);
    });
  });

  describe('findOne', () => {
    it('should return a return order item by id', async () => {
      repository.findOne.mockResolvedValue(mockReturnOrderItem);

      const result = await service.findOne('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { return_order_item_id: 'item-123', is_deleted: false },
      });
      expect(result).toEqual(mockReturnOrderItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a return order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockReturnOrderItem);
      const updateDto = { quantity: 5 };
      const updatedItem = { ...mockReturnOrderItem, ...updateDto };
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-123', updateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { return_order_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should soft delete a return order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockReturnOrderItem);
      repository.save.mockResolvedValue({ ...mockReturnOrderItem, is_deleted: true });

      await service.remove('item-123', mockUser);

      expect(repository.save).toHaveBeenCalledWith({
        ...mockReturnOrderItem,
        is_deleted: true,
      });
    });
  });

  describe('findByReturnOrderId', () => {
    it('should return items by return order id', async () => {
      repository.find.mockResolvedValue([mockReturnOrderItem]);

      const result = await service.findByReturnOrderId('return-123', mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { return_order_id: 'return-123', is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockReturnOrderItem]);
    });
  });
});
