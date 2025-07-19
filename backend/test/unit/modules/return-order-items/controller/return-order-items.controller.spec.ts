import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnOrderItemsController } from 'src/modules/return-order-items/controller/return-order-items.controller';
import { ReturnOrderItemsService } from 'src/modules/return-order-items/service/return-order-items.service';
import { CreateReturnOrderItemDto } from 'src/modules/return-order-items/dto/create-return-order-item.dto';
import { UpdateReturnOrderItemDto } from 'src/modules/return-order-items/dto/update-return-order-item.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('ReturnOrderItemsController', () => {
  let controller: ReturnOrderItemsController;
  let service: jest.Mocked<ReturnOrderItemsService>;

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
  };

  const mockUser: RequestWithUser = {
    user: { id: 'user-123', username: 'testuser', role: 'STORE_STAFF' },
  } as RequestWithUser;

  const mockCreateDto: CreateReturnOrderItemDto = {
    return_order_id: 'return-123',
    product_id: 'product-123',
    product_name: 'Test Product',
    quantity: 3,
    unit_price: 75000,
    total_price: 225000,
    return_reason: 'Defective product',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByReturnOrderId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnOrderItemsController],
      providers: [{ provide: ReturnOrderItemsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReturnOrderItemsController>(ReturnOrderItemsController);
    service = module.get(ReturnOrderItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a return order item successfully', async () => {
      service.create.mockResolvedValue(mockReturnOrderItem);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockReturnOrderItem);
    });
  });

  describe('findAll', () => {
    it('should return all return order items', async () => {
      service.findAll.mockResolvedValue([mockReturnOrderItem]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockReturnOrderItem]);
    });
  });

  describe('findOne', () => {
    it('should return a return order item by id', async () => {
      service.findOne.mockResolvedValue(mockReturnOrderItem);

      const result = await controller.findOne('item-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('item-123', mockUser);
      expect(result).toEqual(mockReturnOrderItem);
    });
  });

  describe('update', () => {
    it('should update a return order item successfully', async () => {
      const updateDto = { quantity: 5 };
      const updatedItem = { ...mockReturnOrderItem, ...updateDto };
      service.update.mockResolvedValue(updatedItem);

      const result = await controller.update('item-123', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('item-123', updateDto, mockUser);
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should remove a return order item successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('item-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('item-123', mockUser);
    });
  });

  describe('findByReturnOrderId', () => {
    it('should return items by return order id', async () => {
      service.findByReturnOrderId.mockResolvedValue([mockReturnOrderItem]);

      const result = await controller.findByReturnOrderId('return-123', mockUser);

      expect(service.findByReturnOrderId).toHaveBeenCalledWith('return-123', mockUser);
      expect(result).toEqual([mockReturnOrderItem]);
    });
  });
});
