import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderItemsController } from 'src/modules/order-items/controller/order-items.controller';
import { OrderItemsService } from 'src/modules/order-items/service/order-items.service';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-order-item.dto';
import { UpdateOrderItemDto } from 'src/modules/order-items/dto/update-order-item.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('OrderItemsController', () => {
  let controller: OrderItemsController;
  let service: jest.Mocked<OrderItemsService>;

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
  };

  const mockOrderItems = [mockOrderItem];

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
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByOrderId: jest.fn(),
      calculateTotals: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemsController],
      providers: [
        {
          provide: OrderItemsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrderItemsController>(OrderItemsController);
    service = module.get(OrderItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order item successfully', async () => {
      service.create.mockResolvedValue(mockOrderItem);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockOrderItem);
    });

    it('should throw BadRequestException when creation fails', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all order items', async () => {
      service.findAll.mockResolvedValue(mockOrderItems);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockOrderItems);
    });
  });

  describe('findOne', () => {
    it('should return an order item by id', async () => {
      service.findOne.mockResolvedValue(mockOrderItem);

      const result = await controller.findOne('item-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('item-123', mockUser);
      expect(result).toEqual(mockOrderItem);
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
    it('should update an order item successfully', async () => {
      const updatedItem = { ...mockOrderItem, ...mockUpdateDto };
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
    it('should remove an order item successfully', async () => {
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

  describe('findByOrderId', () => {
    it('should return items by order id', async () => {
      service.findByOrderId.mockResolvedValue(mockOrderItems);

      const result = await controller.findByOrderId('order-123', mockUser);

      expect(service.findByOrderId).toHaveBeenCalledWith('order-123', mockUser);
      expect(result).toEqual(mockOrderItems);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate order totals', async () => {
      const mockTotals = {
        subtotal: 500000,
        total_discount: 0,
        total_tax: 50000,
        total_amount: 550000,
      };
      service.calculateTotals.mockResolvedValue(mockTotals);

      const result = await controller.calculateTotals('order-123', mockUser);

      expect(service.calculateTotals).toHaveBeenCalledWith(
        'order-123',
        mockUser,
      );
      expect(result).toEqual(mockTotals);
    });
  });
});
