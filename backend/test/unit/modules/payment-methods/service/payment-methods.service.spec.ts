import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethodsService } from 'src/modules/payment-methods/service/payment-methods.service';
import { PaymentMethod } from 'src/entities/tenant/paymentMethod.entity';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-payment-method.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('PaymentMethodsService', () => {
  let service: PaymentMethodsService;
  let repository: jest.Mocked<Repository<PaymentMethod>>;
  let tenantDataSourceService: jest.Mocked<TenantDataSourceService>;

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
  } as PaymentMethod;

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
        PaymentMethodsService,
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockRepository,
        },
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<PaymentMethodsService>(PaymentMethodsService);
    repository = module.get(getRepositoryToken(PaymentMethod));
    tenantDataSourceService = module.get(TenantDataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment method successfully', async () => {
      repository.create.mockReturnValue(mockPaymentMethod);
      repository.save.mockResolvedValue(mockPaymentMethod);

      const result = await service.create(mockCreateDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(mockCreateDto);
      expect(repository.save).toHaveBeenCalledWith(mockPaymentMethod);
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw BadRequestException when save fails', async () => {
      repository.create.mockReturnValue(mockPaymentMethod);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(mockCreateDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all payment methods', async () => {
      const mockMethods = [mockPaymentMethod];
      repository.find.mockResolvedValue(mockMethods);

      const result = await service.findAll(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(mockMethods);
    });
  });

  describe('findActive', () => {
    it('should return active payment methods', async () => {
      const activeMethods = [{ ...mockPaymentMethod, is_active: true }];
      repository.find.mockResolvedValue(activeMethods);

      const result = await service.findActive(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false, is_active: true },
        order: { is_default: 'DESC', created_at: 'DESC' },
      });
      expect(result).toEqual(activeMethods);
    });
  });

  describe('findOne', () => {
    it('should return a payment method by id', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);

      const result = await service.findOne('method-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { payment_method_id: 'method-123', is_deleted: false },
      });
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should throw NotFoundException when method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a payment method successfully', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);
      const updatedMethod = { ...mockPaymentMethod, ...mockUpdateDto };
      repository.save.mockResolvedValue(updatedMethod);

      const result = await service.update(
        'method-123',
        mockUpdateDto,
        mockUser,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { payment_method_id: 'method-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedMethod);
    });

    it('should throw NotFoundException when method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', mockUpdateDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a payment method successfully', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);
      repository.save.mockResolvedValue({
        ...mockPaymentMethod,
        is_deleted: true,
      });

      await service.remove('method-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { payment_method_id: 'method-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockPaymentMethod,
        is_deleted: true,
      });
    });

    it('should throw NotFoundException when method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setDefault', () => {
    it('should set a payment method as default successfully', async () => {
      repository.findOne.mockResolvedValue(mockPaymentMethod);
      repository.update.mockResolvedValue({ affected: 1 } as any);
      const defaultMethod = { ...mockPaymentMethod, is_default: true };
      repository.save.mockResolvedValue(defaultMethod);

      const result = await service.setDefault('method-123', mockUser);

      expect(repository.update).toHaveBeenCalledWith(
        { is_deleted: false },
        { is_default: false },
      );
      expect(repository.save).toHaveBeenCalledWith({
        ...mockPaymentMethod,
        is_default: true,
      });
      expect(result).toEqual(defaultMethod);
    });

    it('should throw NotFoundException when method not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.setDefault('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
