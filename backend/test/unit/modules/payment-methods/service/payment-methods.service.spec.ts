import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-paymentMethod.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-paymentMethod.dto';

describe('PaymentMethodsService', () => {
  let service: PaymentMethodsService;
  let repository: jest.Mocked<Repository<PaymentMethod>>;

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

  const mockCreateDto: CreatePaymentMethodDto = {
    id: 'pm1',
    name: 'Tiền mặt',
    createdByUserId: 'user1',
  };

  const mockUpdateDto: UpdatePaymentMethodDto = {
    name: 'Chuyển khoản',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodsService,
        {
          provide: getRepositoryToken(PaymentMethod, 'globalConnection'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentMethodsService>(PaymentMethodsService);
    repository = module.get(
      getRepositoryToken(PaymentMethod, 'globalConnection'),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment method successfully', async () => {
      repository.findOne.mockResolvedValue(null); // No existing payment method
      repository.create.mockReturnValue(mockPaymentMethod);
      repository.save.mockResolvedValue(mockPaymentMethod);

      const result = await service.create(mockCreateDto, 'user1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: mockCreateDto.name, is_deleted: false },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateDto,
        created_by_user_id: 'user1',
        updated_by_user_id: 'user1',
      });
      expect(repository.save).toHaveBeenCalledWith(mockPaymentMethod);
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw ConflictException when payment method name already exists', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);

      await expect(service.create(mockCreateDto, 'user1')).rejects.toThrow(
        new ConflictException(
          `Payment method with name "${mockCreateDto.name}" already exists`,
        ),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: mockCreateDto.name, is_deleted: false },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted payment methods', async () => {
      const mockPaymentMethods = [mockPaymentMethod];
      repository.find.mockResolvedValue(mockPaymentMethods);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockPaymentMethods);
    });

    it('should return empty array when no payment methods found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return payment method when found', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);

      const result = await service.findOne('pm1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'pm1', is_deleted: false },
      });
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent', is_deleted: false },
      });
    });
  });

  describe('update', () => {
    it('should update payment method successfully', async () => {
      const updatedPaymentMethod = {
        ...mockPaymentMethod,
        name: 'Chuyển khoản',
      };
      repository.findOne.mockImplementation((options: any) => {
        // First call: finding existing payment method by id
        if (options.where.id === 'pm1' && options.where.is_deleted === false) {
          return Promise.resolve(mockPaymentMethod);
        }
        // Second call: checking unique constraint with Not(excludeId) - should return null (no conflict)
        if (
          options.where.name === mockUpdateDto.name &&
          options.where.is_deleted === false
        ) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      repository.save.mockResolvedValue(updatedPaymentMethod);

      const result = await service.update('pm1', mockUpdateDto, 'user2');

      expect(repository.save).toHaveBeenCalledWith({
        ...mockPaymentMethod,
        ...mockUpdateDto,
        updated_by_user_id: 'user2',
      });
      expect(result).toEqual(updatedPaymentMethod);
    });

    it('should throw NotFoundException when payment method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', mockUpdateDto, 'user2'),
      ).rejects.toThrow(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent', is_deleted: false },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updated name already exists', async () => {
      // Create fresh objects to avoid mutation from previous tests
      const originalPaymentMethod = {
        id: 'pm1',
        name: 'Tiền mặt', // Original name
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: undefined,
        is_deleted: false,
        created_by_user_id: 'user1',
        updated_by_user_id: 'user1',
      };

      const existingWithSameName = {
        id: 'pm2',
        name: 'Chuyển khoản', // Same as update name
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: undefined,
        is_deleted: false,
        created_by_user_id: 'user1',
        updated_by_user_id: 'user1',
      };

      // First call returns the payment method to update
      // Second call returns an existing payment method with the same name
      repository.findOne
        .mockResolvedValueOnce(originalPaymentMethod)
        .mockResolvedValueOnce(existingWithSameName);

      await expect(
        service.update('pm1', mockUpdateDto, 'user2'),
      ).rejects.toThrow(
        new ConflictException(
          `Payment method with name "${mockUpdateDto.name}" already exists`,
        ),
      );

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should update without name validation when name is not changed', async () => {
      const updateDtoWithoutName = { name: mockPaymentMethod.name };
      repository.findOne.mockResolvedValue(mockPaymentMethod);
      repository.save.mockResolvedValue(mockPaymentMethod);

      const result = await service.update('pm1', updateDtoWithoutName, 'user2');

      expect(repository.findOne).toHaveBeenCalledTimes(1); // Only called once for finding existing
      expect(result).toEqual(mockPaymentMethod);
    });
  });

  describe('remove', () => {
    it('should soft delete payment method successfully', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);
      const deletedPaymentMethod = {
        ...mockPaymentMethod,
        is_deleted: true,
        updated_by_user_id: 'user2',
      };
      repository.save.mockResolvedValue(deletedPaymentMethod);

      const result = await service.remove('pm1', 'user2');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'pm1', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockPaymentMethod,
        is_deleted: true,
        updated_by_user_id: 'user2',
      });
      expect(result).toEqual({
        message: '✅ Payment method với ID "pm1" đã được xóa mềm',
        data: null,
      });
    });

    it('should throw NotFoundException when payment method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user2')).rejects.toThrow(
        new NotFoundException('Payment method with ID nonexistent not found'),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent', is_deleted: false },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft deleted payment method successfully', async () => {
      const deletedPaymentMethod = { ...mockPaymentMethod, is_deleted: true };
      const restoredPaymentMethod = {
        ...mockPaymentMethod,
        is_deleted: false,
        updated_by_user_id: 'user2',
      };
      repository.findOne.mockResolvedValue(deletedPaymentMethod);
      repository.save.mockResolvedValue(restoredPaymentMethod);

      const result = await service.restore('pm1', 'user2');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'pm1', is_deleted: true },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...deletedPaymentMethod,
        is_deleted: false,
        updated_by_user_id: 'user2',
      });
      expect(result).toEqual(restoredPaymentMethod);
    });

    it('should throw NotFoundException when payment method not found or not deleted', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.restore('nonexistent', 'user2')).rejects.toThrow(
        new NotFoundException(
          'Payment method với ID "nonexistent" không tìm thấy hoặc chưa bị xóa',
        ),
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent', is_deleted: true },
      });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('mapToResponseDto', () => {
    it('should map entity to response DTO correctly', () => {
      const result = service.mapToResponseDto(mockPaymentMethod);

      expect(result).toEqual({
        id: mockPaymentMethod.id,
        name: mockPaymentMethod.name,
        createdAt: mockPaymentMethod.created_at,
        updatedAt: mockPaymentMethod.updated_at,
        deletedAt: mockPaymentMethod.deleted_at,
        isDeleted: mockPaymentMethod.is_deleted,
        createdByUserId: mockPaymentMethod.created_by_user_id,
        updatedByUserId: mockPaymentMethod.updated_by_user_id,
      });
    });
  });
});
