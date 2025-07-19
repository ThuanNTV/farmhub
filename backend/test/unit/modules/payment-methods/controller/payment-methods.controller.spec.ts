import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethodsController } from 'src/modules/payment-methods/controller/payment-methods.controller';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-payment-method.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('PaymentMethodsController', () => {
  let controller: PaymentMethodsController;
  let service: jest.Mocked<PaymentMethodsService>;

  // Mock data
  const mockPaymentMethod = {
    payment_method_id: 'method-123',
    method_name: 'Credit Card',
    method_code: 'CREDIT_CARD',
    description: 'Payment via credit card',
    is_active: true,
    is_default: false,
    processing_fee: 2.5,
    min_amount: 10000,
    max_amount: 50000000,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  };

  const mockPaymentMethods = [mockPaymentMethod];

  const mockUser: RequestWithUser = {
    user: {
      id: 'user-123',
      username: 'testuser',
      role: 'STORE_MANAGER',
    },
  } as RequestWithUser;

  const mockCreateDto: CreatePaymentMethodDto = {
    method_name: 'Credit Card',
    method_code: 'CREDIT_CARD',
    description: 'Payment via credit card',
    is_active: true,
    is_default: false,
    processing_fee: 2.5,
    min_amount: 10000,
    max_amount: 50000000,
  };

  const mockUpdateDto: UpdatePaymentMethodDto = {
    method_name: 'Debit Card',
    processing_fee: 1.5,
    max_amount: 30000000,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActive: jest.fn(),
      setDefault: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodsController],
      providers: [
        {
          provide: PaymentMethodsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentMethodsController>(PaymentMethodsController);
    service = module.get(PaymentMethodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment method successfully', async () => {
      service.create.mockResolvedValue(mockPaymentMethod);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw BadRequestException when creation fails', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.create(mockCreateDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all payment methods', async () => {
      service.findAll.mockResolvedValue(mockPaymentMethods);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockPaymentMethods);
    });
  });

  describe('findActive', () => {
    it('should return active payment methods', async () => {
      const activePaymentMethods = [{ ...mockPaymentMethod, is_active: true }];
      service.findActive.mockResolvedValue(activePaymentMethods);

      const result = await controller.findActive(mockUser);

      expect(service.findActive).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(activePaymentMethods);
    });
  });

  describe('findOne', () => {
    it('should return a payment method by id', async () => {
      service.findOne.mockResolvedValue(mockPaymentMethod);

      const result = await controller.findOne('method-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('method-123', mockUser);
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw NotFoundException when method not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Payment method not found'));

      await expect(controller.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a payment method successfully', async () => {
      const updatedMethod = { ...mockPaymentMethod, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedMethod);

      const result = await controller.update('method-123', mockUpdateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('method-123', mockUpdateDto, mockUser);
      expect(result).toEqual(updatedMethod);
    });

    it('should throw NotFoundException when updating non-existent method', async () => {
      service.update.mockRejectedValue(new NotFoundException('Payment method not found'));

      await expect(controller.update('nonexistent', mockUpdateDto, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a payment method successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('method-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('method-123', mockUser);
    });

    it('should throw NotFoundException when removing non-existent method', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Payment method not found'));

      await expect(controller.remove('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefault', () => {
    it('should set a payment method as default successfully', async () => {
      const defaultMethod = { ...mockPaymentMethod, is_default: true };
      service.setDefault.mockResolvedValue(defaultMethod);

      const result = await controller.setDefault('method-123', mockUser);

      expect(service.setDefault).toHaveBeenCalledWith('method-123', mockUser);
      expect(result).toEqual(defaultMethod);
    });

    it('should throw NotFoundException when setting non-existent method as default', async () => {
      service.setDefault.mockRejectedValue(new NotFoundException('Payment method not found'));

      await expect(controller.setDefault('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
