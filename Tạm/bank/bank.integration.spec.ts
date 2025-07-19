import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BankService } from '../../../src/modules/bank/service/bank.service';
import { Bank } from '../../../src/entities/global/bank.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlobalDatabaseModule } from '../../../src/config/db/dbtenant/global-database.module';
import { BankModule } from '../../../src/modules/bank/bank.module';
import { CreateBankDto } from '../../../src/modules/bank/dto/create-bank.dto';

describe('BankService Integration', () => {
  let app: INestApplication;
  let bankService: BankService;
  let bankRepository: Repository<Bank>;

  // UUID hợp lệ cho test
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GlobalDatabaseModule, BankModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bankService = moduleFixture.get<BankService>(BankService);
    bankRepository = moduleFixture.get<Repository<Bank>>(
      getRepositoryToken(Bank, 'globalConnection'),
    );
  });

  beforeEach(async () => {
    // Clean up database before each test
    await bankRepository.clear();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });


  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('create', () => {
    it('should create a new bank and verify it exists in real database', async () => {
      const createBankDto: CreateBankDto = {
        name: 'Vietcombank Integration Test',
        id: 'VCB_INTEGRATION',
      };

      // Create the bank
      const result = await bankService.create(createBankDto, testUserId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.name).toBe(createBankDto.name);
      expect(result.id).toBe(createBankDto.id);
      expect(result.created_by_user_id).toBe(testUserId);

      // Verify the bank exists in real database
      const foundBank = await bankService.findOne(createBankDto.id!);
      expect(foundBank).toBeDefined();
      expect(foundBank.id).toBe(createBankDto.id);
      expect(foundBank.name).toBe(createBankDto.name);

      // Also verify directly with repository
      const dbBank = await bankRepository.findOneBy({
        id: createBankDto.id!,
        is_deleted: false,
      });
      expect(dbBank).not.toBeNull();
      expect(dbBank!.id).toBe(createBankDto.id);
      expect(dbBank!.name).toBe(createBankDto.name);
      expect(dbBank!.created_by_user_id).toBe(testUserId);
      expect(dbBank!.is_deleted).toBe(false);
    });

    it('should create multiple banks and verify they all exist', async () => {
      const banks = [
        { name: 'Techcombank', id: 'TCB_INTEGRATION' },
        { name: 'BIDV', id: 'BIDV_INTEGRATION' },
        { name: 'Agribank', id: 'AGB_INTEGRATION' },
      ];

      // Create all banks
      const createdBanks = await Promise.all(
        banks.map((bank) => bankService.create(bank, testUserId)),
      );

      expect(createdBanks).toHaveLength(3);

      // Verify all banks exist in database
      for (const bank of banks) {
        const foundBank = await bankService.findOne(bank.id);
        expect(foundBank).toBeDefined();
        expect(foundBank.id).toBe(bank.id);
        expect(foundBank.name).toBe(bank.name);
      }

      // Verify with findAll
      const allBanks = await bankService.findAll();
      expect(allBanks.length).toBeGreaterThanOrEqual(3);

      const createdBankIds = banks.map((b) => b.id);
      const foundBankIds = allBanks.map((b) => b.id);
      createdBankIds.forEach((id) => {
        expect(foundBankIds).toContain(id);
      });
    });

    it('should fail to find non-existent bank', async () => {
      const nonExistentId = 'NON_EXISTENT_BANK';

      await expect(bankService.findOne(nonExistentId)).rejects.toThrow(
        new NotFoundException('Bank not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted banks from real database', async () => {
      const banks = [
        { name: 'Bank A', id: 'BANK_A' },
        { name: 'Bank B', id: 'BANK_B' },
        { name: 'Bank C', id: 'BANK_C' },
      ];

      // Create banks
      await Promise.all(
        banks.map((bank) => bankService.create(bank, testUserId)),
      );

      // Get all banks
      const allBanks = await bankService.findAll();

      expect(allBanks.length).toBeGreaterThanOrEqual(3);

      const createdBankIds = banks.map((b) => b.id);
      const foundBankIds = allBanks.map((b) => b.id);

      createdBankIds.forEach((id) => {
        expect(foundBankIds).toContain(id);
      });
    });
  });

  describe('update', () => {
    it('should update bank and verify changes in real database', async () => {
      const createBankDto: CreateBankDto = {
        name: 'Original Bank Name',
        id: 'UPDATE_TEST_BANK',
      };

      // Create bank
      await bankService.create(createBankDto, testUserId);

      // Update bank
      const updatedName = 'Updated Bank Name';
      const updatedBank = await bankService.update(
        createBankDto.id!,
        {
          name: updatedName,
        },
        testUserId,
      );

      expect(updatedBank.name).toBe(updatedName);

      // Verify in database
      const foundBank = await bankService.findOne(createBankDto.id!);
      expect(foundBank.name).toBe(updatedName);

      // Verify with repository
      const dbBank = await bankRepository.findOneBy({
        id: createBankDto.id!,
        is_deleted: false,
      });
      expect(dbBank).not.toBeNull();
      expect(dbBank!.name).toBe(updatedName);
      expect(dbBank!.updated_by_user_id).toBe(testUserId);
    });
  });

  describe('remove', () => {
    it('should soft delete bank and verify it is not found', async () => {
      const createBankDto: CreateBankDto = {
        name: 'Bank to Delete',
        id: 'DELETE_TEST_BANK',
      };

      // Create bank
      await bankService.create(createBankDto, testUserId);

      // Verify bank exists
      const foundBank = await bankService.findOne(createBankDto.id!);
      expect(foundBank).toBeDefined();

      // Remove bank
      await bankService.remove(createBankDto.id!, testUserId);

      // Verify bank is not found
      await expect(bankService.findOne(createBankDto.id!)).rejects.toThrow(
        new NotFoundException('Bank not found'),
      );

      // Verify in database that it's soft deleted
      const dbBank = await bankRepository.findOneBy({ id: createBankDto.id! });
      expect(dbBank).not.toBeNull();
      expect(dbBank!.is_deleted).toBe(true);
      expect(dbBank!.updated_by_user_id).toBe(testUserId);
    });
  });
});
