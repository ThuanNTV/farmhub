import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderItemsService } from 'src/modules/order-items/service/order-items.service';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-order-item.dto';
import { UpdateOrderItemDto } from 'src/modules/order-items/dto/update-order-item.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('OrderItemsService', () => {
  let service: OrderItemsService;
  let repository: jest.Mocked<Repository<OrderItem>>;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;

  // Mock data
  const mockOrderItem = {
    order_item_id: 'item-123',
    order_id: 'order-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 5,
    unit_price: 100000,
    total_price: 500000,
    discount_amount: 0,
    tax_amount: 50000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  } as OrderItem;

  const mockUser: RequestWithUser = {
    user: {
      id: 'user-123',
      username: 'testuser',
      role: 'STORE_STAFF',
    },
  } as RequestWithUser;

  const mockCreateDto: CreateOrderItemDto = {
    order_id: 'order-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 5,
    unit_price: 100000,
    total_price: 500000,
    discount_amount: 0,
    tax_amount: 50000,
  };

  const mockUpdateDto: UpdateOrderItemDto = {
    quantity: 8,
    unit_price: 110000,
    total_price: 880000,
    tax_amount: 88000,
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
        OrderItemsService,
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository,
        },
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<OrderItemsService>(OrderItemsService);
    repository = module.get(getRepositoryToken(OrderItem));
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order item successfully', async () => {
      repository.create.mockReturnValue(mockOrderItem);
      repository.save.mockResolvedValue(mockOrderItem);

      const result = await service.create(mockCreateDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(repository.save).toHaveBeenCalledWith(mockOrderItem);
      expect(result).toEqual(mockOrderItem);
    });

    it('should throw BadRequestException when save fails', async () => {
      repository.create.mockReturnValue(mockOrderItem);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all order items', async () => {
      const mockItems = [mockOrderItem];
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
    it('should return an order item by id', async () => {
      repository.findOne.mockResolvedValue(mockOrderItem);

      const result = await service.findOne('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { order_item_id: 'item-123', is_deleted: false },
      });
      expect(result).toEqual(mockOrderItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockOrderItem);
      const updatedItem = { ...mockOrderItem, ...mockUpdateDto };
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update('item-123', mockUpdateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { order_item_id: 'item-123', is_deleted: false },
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
    it('should soft delete an order item successfully', async () => {
      repository.findOne.mockResolvedValue(mockOrderItem);
      repository.save.mockResolvedValue({ ...mockOrderItem, is_deleted: true });

      await service.remove('item-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { order_item_id: 'item-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockOrderItem,
        is_deleted: true,
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderId', () => {
    it('should return items by order id', async () => {
      const mockItems = [mockOrderItem];
      repository.find.mockResolvedValue(mockItems);

      const result = await service.findByOrderId('order-123', mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { order_id: 'order-123', is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockItems);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate order totals correctly', async () => {
      const mockItems = [
        { ...mockOrderItem, total_price: 500000, discount_amount: 50000, tax_amount: 45000 },
        { ...mockOrderItem, total_price: 300000, discount_amount: 30000, tax_amount: 27000 },
      ];
      repository.find.mockResolvedValue(mockItems);

      const result = await service.calculateTotals('order-123', mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { order_id: 'order-123', is_deleted: false },
      });
      expect(result).toEqual({
        subtotal: 800000,
        total_discount: 80000,
        total_tax: 72000,
        total_amount: 792000,
      });
    });
  });
});
