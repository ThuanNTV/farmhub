import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DispatchOrderItemsController } from 'src/modules/dispatch-order-items/controller/dispatch-order-items.controller';
import { DispatchOrderItemsService } from 'src/modules/dispatch-order-items/service/dispatch-order-items.service';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatch-order-item.dto';
import { UpdateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/update-dispatch-order-item.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('DispatchOrderItemsController', () => {
  let controller: DispatchOrderItemsController;
  let service: jest.Mocked<DispatchOrderItemsService>;

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
  };

  const mockDispatchOrderItems = [mockDispatchOrderItem];

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
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByDispatchOrderId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchOrderItemsController],
      providers: [
        {
          provide: DispatchOrderItemsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DispatchOrderItemsController>(
      DispatchOrderItemsController,
    );
    service = module.get(DispatchOrderItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a dispatch order item successfully', async () => {
      service.create.mockResolvedValue(mockDispatchOrderItem);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockDispatchOrderItem);
    });

    it('should throw BadRequestException when creation fails', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all dispatch order items', async () => {
      service.findAll.mockResolvedValue(mockDispatchOrderItems);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockDispatchOrderItems);
    });
  });

  describe('findOne', () => {
    it('should return a dispatch order item by id', async () => {
      service.findOne.mockResolvedValue(mockDispatchOrderItem);

      const result = await controller.findOne('item-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('item-123', mockUser);
      expect(result).toEqual(mockDispatchOrderItem);
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
    it('should update a dispatch order item successfully', async () => {
      const updatedItem = { ...mockDispatchOrderItem, ...mockUpdateDto };
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
    it('should remove a dispatch order item successfully', async () => {
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

  describe('findByDispatchOrderId', () => {
    it('should return items by dispatch order id', async () => {
      service.findByDispatchOrderId.mockResolvedValue(mockDispatchOrderItems);

      const result = await controller.findByDispatchOrderId(
        'dispatch-123',
        mockUser,
      );

      expect(service.findByDispatchOrderId).toHaveBeenCalledWith(
        'dispatch-123',
        mockUser,
      );
      expect(result).toEqual(mockDispatchOrderItems);
    });
  });
});
