import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateBankDto } from 'src/modules/bank/dto/create-bank.dto';
import { UpdateBankDto } from 'src/modules/bank/dto/update-bank.dto';
import { BankService } from 'src/modules/bank/service/bank.service';
import { Bank } from 'src/entities/global/bank.entity';

describe('BankService', () => {
  let service: BankService;
  let mockBankRepository: jest.Mocked<any>;

  const mockBank: Bank = {
    id: 'BANK001',
    name: 'Test Bank',
    created_at: new Date(),
    updated_at: new Date(),
    created_by_user_id: '123e4567-e89b-12d3-a456-426614174000',
    updated_by_user_id: '123e4567-e89b-12d3-a456-426614174000',
    is_deleted: false,
  };

  const mockBankResponse = {
    id: 'BANK001',
    name: 'Test Bank',
    created_at: mockBank.created_at,
    updated_at: mockBank.updated_at,
    created_by_user_id: mockBank.created_by_user_id,
    updated_by_user_id: mockBank.updated_by_user_id,
    is_deleted: false,
  };

  beforeEach(async () => {
    mockBankRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        {
          provide: getRepositoryToken(Bank, 'globalConnection'),
          useValue: mockBankRepository,
        },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBankDto: CreateBankDto = {
      name: 'Test Bank',
      id: 'BANK001',
    };

    it('should create a bank successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockBankRepository.create.mockReturnValue(mockBank);
      mockBankRepository.save.mockResolvedValue(mockBank);

      const result = await service.create(createBankDto, userId);

      expect(result).toEqual(mockBankResponse);
      expect(mockBankRepository.create).toHaveBeenCalledWith({
        ...createBankDto,
        created_by_user_id: userId,
        is_deleted: false,
      });
      expect(mockBankRepository.save).toHaveBeenCalledWith(mockBank);
    });

    it('should handle creation without optional fields', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const createDtoWithoutId: CreateBankDto = {
        name: 'Test Bank',
      };

      const bankWithoutId = { ...mockBank, id: undefined };
      mockBankRepository.create.mockReturnValue(bankWithoutId);
      mockBankRepository.save.mockResolvedValue(bankWithoutId);

      const result = await service.create(createDtoWithoutId, userId);

      expect(result).toBeDefined();
      expect(mockBankRepository.create).toHaveBeenCalledWith({
        ...createDtoWithoutId,
        created_by_user_id: userId,
        is_deleted: false,
      });
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted banks', async () => {
      const banks = [mockBank];
      mockBankRepository.find.mockResolvedValue(banks);

      const result = await service.findAll();

      expect(result).toEqual([mockBankResponse]);
      expect(mockBankRepository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no banks exist', async () => {
      mockBankRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findAllWithFilter', () => {
    const makeQB = (rows: any[], count = rows.length) => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([rows, count]),
      };
      return qb;
    };

    it('should return paginated banks without search', async () => {
      const rows = [mockBank];
      const qb = makeQB(rows, 1);
      mockBankRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllWithFilter({ page: 2, limit: 5 });

      expect(mockBankRepository.createQueryBuilder).toHaveBeenCalledWith('b');
      expect(qb.where).toHaveBeenCalledWith('b.is_deleted = :isDeleted', {
        isDeleted: false,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('b.created_at', 'DESC');
      expect(qb.skip).toHaveBeenCalledWith((2 - 1) * 5);
      expect(qb.take).toHaveBeenCalledWith(5);
      expect(result.total).toBe(1);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.data[0].id).toBe(mockBank.id);
    });

    it('should apply search filter (LIKE on name)', async () => {
      const rows = [mockBank];
      const qb = makeQB(rows, 1);
      mockBankRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllWithFilter({
        search: 'test',
        page: 1,
        limit: 10,
      });

      expect(qb.andWhere).toHaveBeenCalledWith('LOWER(b.name) LIKE :search', {
        search: '%test%',
      });
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return bank by ID', async () => {
      const bankId = 'BANK001';
      mockBankRepository.findOneBy.mockResolvedValue(mockBank);

      const result = await service.findOne(bankId);

      expect(result).toEqual(mockBankResponse);
      expect(mockBankRepository.findOneBy).toHaveBeenCalledWith({
        id: bankId,
        is_deleted: false,
      });
    });

    it('should throw NotFoundException if bank not found', async () => {
      const bankId = 'NONEXISTENT';
      mockBankRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(bankId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update bank successfully', async () => {
      const bankId = 'BANK001';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateBankDto: UpdateBankDto = {
        name: 'Updated Bank Name',
      };

      const updatedBank = { ...mockBank, name: 'Updated Bank Name' };

      mockBankRepository.findOneBy.mockResolvedValue(mockBank);
      mockBankRepository.merge.mockReturnValue(updatedBank);
      mockBankRepository.save.mockResolvedValue(updatedBank);

      const result = await service.update(bankId, updateBankDto, userId);

      expect(result.name).toBe('Updated Bank Name');
      expect(mockBankRepository.merge).toHaveBeenCalledWith(
        mockBank,
        updateBankDto,
        {
          updated_by_user_id: userId,
        },
      );
      expect(mockBankRepository.save).toHaveBeenCalledWith(updatedBank);
    });

    it('should throw NotFoundException if bank not found during update', async () => {
      const bankId = 'NONEXISTENT';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateBankDto: UpdateBankDto = {
        name: 'Updated Bank Name',
      };

      mockBankRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update(bankId, updateBankDto, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete bank successfully', async () => {
      const bankId = 'BANK001';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockBankRepository.findOneBy.mockResolvedValue(mockBank);
      mockBankRepository.save.mockResolvedValue({
        ...mockBank,
        is_deleted: true,
      });

      await service.remove(bankId, userId);

      expect(mockBank.is_deleted).toBe(true);
      expect(mockBank.updated_by_user_id).toBe(userId);
      expect(mockBankRepository.save).toHaveBeenCalledWith(mockBank);
    });

    it('should throw NotFoundException if bank not found during removal', async () => {
      const bankId = 'NONEXISTENT';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockBankRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(bankId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted bank', async () => {
      const bankId = 'BANK001';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedBank = { ...mockBank, is_deleted: true };

      mockBankRepository.findOne.mockResolvedValue(deletedBank);
      mockBankRepository.save.mockResolvedValue({
        ...deletedBank,
        is_deleted: false,
      });

      const result = await service.restore(bankId, userId);

      expect(result.is_deleted).toBe(false);
      expect(mockBankRepository.findOne).toHaveBeenCalledWith({
        where: { id: bankId, is_deleted: true },
      });
      expect(mockBankRepository.save).toHaveBeenCalledWith({
        ...deletedBank,
        is_deleted: false,
        updated_by_user_id: userId,
      });
    });

    it('should throw NotFoundException if bank not found for restore', async () => {
      const bankId = 'NONEXISTENT';
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockBankRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(bankId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      mockBankRepository.findOneBy.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findOne('test-id')).rejects.toThrow();
    });

    it('should handle repository save errors', async () => {
      mockBankRepository.findOneBy.mockResolvedValue(mockBank);
      mockBankRepository.save.mockRejectedValue(
        new Error('Save operation failed'),
      );

      await expect(service.remove('test-id', 'user-id')).rejects.toThrow();
    });
  });

  describe('validation scenarios', () => {
    it('should handle invalid bank ID format', async () => {
      const invalidId = '';
      mockBankRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(invalidId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle update with empty data', async () => {
      const bankId = 'BANK001';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateBankDto: UpdateBankDto = {};

      mockBankRepository.findOneBy.mockResolvedValue(mockBank);
      mockBankRepository.merge.mockReturnValue(mockBank);
      mockBankRepository.save.mockResolvedValue(mockBank);

      const result = await service.update(bankId, updateBankDto, userId);

      expect(result.name).toBe('Test Bank');
      expect(mockBankRepository.merge).toHaveBeenCalledWith(
        mockBank,
        updateBankDto,
        {
          updated_by_user_id: userId,
        },
      );
    });
  });

  describe('bank management scenarios', () => {
    it('should handle bank name updates', async () => {
      const bankId = 'BANK001';
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateBankDto = {
        name: 'New Bank Name',
      };

      const updatedBank = { ...mockBank, name: 'New Bank Name' };

      mockBankRepository.findOneBy.mockResolvedValue(mockBank);
      mockBankRepository.merge.mockReturnValue(updatedBank);
      mockBankRepository.save.mockResolvedValue(updatedBank);

      const result = await service.update(bankId, updateDto, userId);

      expect(result.name).toBe('New Bank Name');
    });

    it('should handle multiple bank operations', async () => {
      const banks = [
        { ...mockBank, id: 'BANK001', name: 'Bank 1' },
        { ...mockBank, id: 'BANK002', name: 'Bank 2' },
      ];

      mockBankRepository.find.mockResolvedValue(banks);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Bank 1');
      expect(result[1].name).toBe('Bank 2');
    });
  });
});
