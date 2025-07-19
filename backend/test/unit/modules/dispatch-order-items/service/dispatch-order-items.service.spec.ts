import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DispatchOrderItemsService } from 'src/modules/dispatch-order-items/service/dispatch-order-items.service';
import { DispatchOrderItem } from 'src/entities/tenant/dispatchOrderItem.entity';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatch-order-item.dto';
import { UpdateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/update-dispatch-order-item.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('DispatchOrderItemsService', () => {
  let service: DispatchOrderItemsService;
  let repository: jest.Mocked<Repository<DispatchOrderItem>>;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;

  // Mock data
  const mockDispatchOrderItem = {
    dispatch_order_item_id: 'item-123',
    dispatch_order_id: 'dispatch-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 10,
    unit_price: 50000,
    total_price: 500000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  } as DispatchOrderItem;

  const mockUser: RequestWithUser = {
    user: {
      id: 'user-123',
      username: 'testuser',
      role: 'STORE_STAFF',
    },
  } as RequestWithUser;

  const mockCreateDto: CreateDispatchOrderItemDto = {
    dispatch_order_id: 'dispatch-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 10,
    unit_price: 50000,
    total_price: 500000,
  };

  const mockUpdateDto: UpdateDispatchOrderItemDto = {
    quantity: 15,
    unit_price: 55000,
    total_price: 825000,
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
        DispatchOrderItemsService,
        {
          provide: getRepositoryToken(DispatchOrderItem),
          useValue: mockRepository,
        },
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<DispatchOrderItemsService>(DispatchOrderItemsService);
    repository = module.get(getRepositoryToken(DispatchOrderItem));
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dispatch order item successfully', async () => {
      repository.create.mockReturnValue(mockDispatchOrderItem);
      repository.save.mockResolvedValue(mockDispatchOrderItem);

      const result = await service.create(mockCreateDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(repository.save).toHaveBeenCalledWith(mockDispatchOrderItem);
      expect(result).toEqual(mockDispatchOrderItem);
    });

    it('should throw BadRequestException when save fails', async () => {
      repository.create.mockReturnValue(mockDispatchOrderItem);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all dispatch order items', async () => {
      const mockItems = [mockDispatchOrderItem];
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
    it('should return a dispatch order item by id', async () => {
      repository.findOne.mockResolvedValue(mockDispatchOrderItem);

      const result = await service.findOne('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { dispatch_order_item_id: 'item-123', is_deleted: false },
      });
      expect(result).toEqual(mockDispatchOrderItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dispatch order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockDispatchOrderItem);
      const updatedItem = { ...mockDispatchOrderItem, ...mockUpdateDto };
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-123', mockUpdateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { dispatch_order_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', mockUpdateDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a dispatch order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockDispatchOrderItem);
      repository.save.mockResolvedValue({
        ...mockDispatchOrderItem,
        is_deleted: true,
      });

      await service.remove('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { dispatch_order_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockDispatchOrderItem,
        is_deleted: true,
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByDispatchOrderId', () => {
    it('should return items by dispatch order id', async () => {
      const mockItems = [mockDispatchOrderItem];
      repository.find.mockResolvedValue(mockItems);

      const result = await service.findByDispatchOrderId(
        'dispatch-123',
        mockUser,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: { dispatch_order_id: 'dispatch-123', is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockItems);
    });
  });
});
