import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodsController } from 'src/modules/payment-methods/controller/payment-methods.controller';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-paymentMethod.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-paymentMethod.dto';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/paymentMethod-response.dto';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { RequestWithUser } from 'src/common/types/common.types';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('PaymentMethodsController', () => {
  let controller: PaymentMethodsController;
  let service: jest.Mocked<PaymentMethodsService>;

  const mockPaymentMethod: PaymentMethod = {
    id: 'pm1',
    name: 'Tiền mặt',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    deleted_at: undefined,
    is_deleted: false,
    created_by_user_id: 'user1',
    updated_by_user_id: 'user1',
  };

  const mockResponseDto: PaymentMethodResponseDto = {
    id: 'pm1',
    name: 'Tiền mặt',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: undefined,
    isDeleted: false,
    createdByUserId: 'user1',
    updatedByUserId: 'user1',
  };

  const mockCreateDto: CreatePaymentMethodDto = {
    id: 'pm1',
    name: 'Tiền mặt',
    createdByUserId: 'user1',
  };

  const mockUpdateDto: UpdatePaymentMethodDto = {
    name: 'Chuyển khoản',
  };

  const mockRequest = {
    user: {
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'ADMIN_GLOBAL',
      storeAccess: [],
    },
  } as unknown as RequestWithUser;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      mapToResponseDto: jest.fn(),
    };

    const mockSecurityService = {
      validatePermission: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodsController],
      providers: [
        {
          provide: PaymentMethodsService,
          useValue: mockService,
        },
        {
          provide: 'SecurityService',
          useValue: mockSecurityService,
        },
        Reflector,
      ],
    })
      .overrideGuard(
        require('src/common/auth/enhanced-auth.guard').EnhancedAuthGuard,
      )
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(
        require('src/core/rbac/permission/permission.guard').PermissionGuard,
      )
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideInterceptor(
        require('src/common/auth/audit.interceptor').AuditInterceptor,
      )
      .useValue({
        intercept: jest
          .fn()
          .mockImplementation((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<PaymentMethodsController>(PaymentMethodsController);
    service = module.get(PaymentMethodsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment method successfully', async () => {
      service.create.mockResolvedValue(mockPaymentMethod);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.create(mockCreateDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, 'user1');
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockPaymentMethod);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw ConflictException when payment method name already exists', async () => {
      service.create.mockRejectedValue(
        new ConflictException(
          `Payment method with name "${mockCreateDto.name}" already exists`,
        ),
      );

      await expect(
        controller.create(mockCreateDto, mockRequest),
      ).rejects.toThrow(ConflictException);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, 'user1');
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all payment methods', async () => {
      const mockPaymentMethods = [mockPaymentMethod];
      const mockResponseDtos = [mockResponseDto];
      service.findAll.mockResolvedValue(mockPaymentMethods);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockPaymentMethod);
      expect(result).toEqual(mockResponseDtos);
    });

    it('should return empty array when no payment methods found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return payment method when found', async () => {
      service.findOne.mockResolvedValue(mockPaymentMethod);
      service.mapToResponseDto.mockReturnValue(mockResponseDto);

      const result = await controller.findOne('pm1');

      expect(service.findOne).toHaveBeenCalledWith('pm1');
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockPaymentMethod);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith('nonexistent');
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update payment method successfully', async () => {
      const updatedPaymentMethod = {
        ...mockPaymentMethod,
        name: 'Chuyển khoản',
      };
      const updatedResponseDto = { ...mockResponseDto, name: 'Chuyển khoản' };
      service.update.mockResolvedValue(updatedPaymentMethod);
      service.mapToResponseDto.mockReturnValue(updatedResponseDto);

      const result = await controller.update('pm1', mockUpdateDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(
        'pm1',
        mockUpdateDto,
        'user1',
      );
      expect(service.mapToResponseDto).toHaveBeenCalledWith(
        updatedPaymentMethod,
      );
      expect(result).toEqual(updatedResponseDto);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      await expect(
        controller.update('nonexistent', mockUpdateDto, mockRequest),
      ).rejects.toThrow(NotFoundException);

      expect(service.update).toHaveBeenCalledWith(
        'nonexistent',
        mockUpdateDto,
        'user1',
      );
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updated name already exists', async () => {
      service.update.mockRejectedValue(
        new ConflictException(
          `Payment method with name "${mockUpdateDto.name}" already exists`,
        ),
      );

      await expect(
        controller.update('pm1', mockUpdateDto, mockRequest),
      ).rejects.toThrow(ConflictException);

      expect(service.update).toHaveBeenCalledWith(
        'pm1',
        mockUpdateDto,
        'user1',
      );
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete payment method successfully', async () => {
      service.remove.mockResolvedValue({
        message: '✅ Payment method với ID "pm1" đã được xóa mềm',
        data: null,
      });

      const result = await controller.remove('pm1', mockRequest);

      expect(service.remove).toHaveBeenCalledWith('pm1', 'user1');
      expect(result).toEqual({ message: 'Xóa thành công' });
    });

    it('should throw NotFoundException when payment method not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      await expect(
        controller.remove('nonexistent', mockRequest),
      ).rejects.toThrow(NotFoundException);

      expect(service.remove).toHaveBeenCalledWith('nonexistent', 'user1');
    });
  });

  describe('restore', () => {
    it('should restore soft deleted payment method successfully', async () => {
      const restoredPaymentMethod = { ...mockPaymentMethod, is_deleted: false };
      const restoredResponseDto = { ...mockResponseDto, isDeleted: false };
      service.restore.mockResolvedValue(restoredPaymentMethod);
      service.mapToResponseDto.mockReturnValue(restoredResponseDto);

      const result = await controller.restore('pm1', mockRequest);

      expect(service.restore).toHaveBeenCalledWith('pm1', 'user1');
      expect(service.mapToResponseDto).toHaveBeenCalledWith(
        restoredPaymentMethod,
      );
      expect(result).toEqual(restoredResponseDto);
    });

    it('should throw NotFoundException when payment method not found or not deleted', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException(
          'Payment method với ID "nonexistent" không tìm thấy hoặc chưa bị xóa',
        ),
      );

      await expect(
        controller.restore('nonexistent', mockRequest),
      ).rejects.toThrow(NotFoundException);

      expect(service.restore).toHaveBeenCalledWith('nonexistent', 'user1');
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });
});
