import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GlobalEntityService } from 'src/service/global-entity.service';
import { User } from 'src/entities/global/user.entity';
import { Bank } from 'src/entities/global/bank.entity';
import { Unit } from 'src/entities/global/unit.entity';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { Store } from 'src/entities/global/store.entity';

describe('GlobalEntityService', () => {
  let service: GlobalEntityService;
  let userRepository: { findOne: jest.Mock; find: jest.Mock };
  let bankRepository: { findOne: jest.Mock; find: jest.Mock };
  let unitRepository: { findOne: jest.Mock; find: jest.Mock };
  let paymentMethodRepository: { findOne: jest.Mock; find: jest.Mock };
  let storeRepository: { findOne: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    userRepository = { findOne: jest.fn(), find: jest.fn() };
    bankRepository = { findOne: jest.fn(), find: jest.fn() };
    unitRepository = { findOne: jest.fn(), find: jest.fn() };
    paymentMethodRepository = { findOne: jest.fn(), find: jest.fn() };
    storeRepository = { findOne: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalEntityService,
        {
          provide: getRepositoryToken(User, 'globalConnection'),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Bank, 'globalConnection'),
          useValue: bankRepository,
        },
        {
          provide: getRepositoryToken(Unit, 'globalConnection'),
          useValue: unitRepository,
        },
        {
          provide: getRepositoryToken(PaymentMethod, 'globalConnection'),
          useValue: paymentMethodRepository,
        },
        {
          provide: getRepositoryToken(Store, 'globalConnection'),
          useValue: storeRepository,
        },
      ],
    }).compile();

    service = module.get<GlobalEntityService>(GlobalEntityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { user_id: 'u1', name: 'Test User' };
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.getUserById('u1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'u1' },
      });
      expect(user).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const user = await service.getUserById('not-exist');

      expect(user).toBeNull();
    });

    it('should return null when userId is empty', async () => {
      const user = await service.getUserById('');

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(user).toBeNull();
    });

    it('should return null when userId is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await service.getUserById(undefined as any);

      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(user).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      const user = await service.getUserById('u1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching user u1:',
        expect.any(Error),
      );
      expect(user).toBeNull();

      loggerSpy.mockRestore();
    });
  });

  describe('getBankById', () => {
    it('should return bank when found', async () => {
      const mockBank = { id: 'b1', name: 'Test Bank' };
      bankRepository.findOne.mockResolvedValue(mockBank);

      const bank = await service.getBankById('b1');

      expect(bankRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'b1' },
      });
      expect(bank).toEqual(mockBank);
    });

    it('should return null when bank not found', async () => {
      bankRepository.findOne.mockResolvedValue(null);

      const bank = await service.getBankById('not-exist');

      expect(bank).toBeNull();
    });

    it('should return null when bankId is empty', async () => {
      const bank = await service.getBankById('');

      expect(bankRepository.findOne).not.toHaveBeenCalled();
      expect(bank).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      bankRepository.findOne.mockRejectedValue(new Error('Database error'));

      const bank = await service.getBankById('b1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching bank b1:',
        expect.any(Error),
      );
      expect(bank).toBeNull();

      loggerSpy.mockRestore();
    });
  });

  describe('getUnitById', () => {
    it('should return unit when found', async () => {
      const mockUnit = { id: 'unit1', name: 'Test Unit' };
      unitRepository.findOne.mockResolvedValue(mockUnit);

      const unit = await service.getUnitById('unit1');

      expect(unitRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'unit1' },
      });
      expect(unit).toEqual(mockUnit);
    });

    it('should return null when unit not found', async () => {
      unitRepository.findOne.mockResolvedValue(null);

      const unit = await service.getUnitById('not-exist');

      expect(unit).toBeNull();
    });

    it('should return null when unitId is empty', async () => {
      const unit = await service.getUnitById('');

      expect(unitRepository.findOne).not.toHaveBeenCalled();
      expect(unit).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      unitRepository.findOne.mockRejectedValue(new Error('Database error'));

      const unit = await service.getUnitById('unit1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching unit unit1:',
        expect.any(Error),
      );
      expect(unit).toBeNull();

      loggerSpy.mockRestore();
    });
  });

  describe('getPaymentMethodById', () => {
    it('should return payment method when found', async () => {
      const mockPaymentMethod = { id: 'pm1', name: 'Credit Card' };
      paymentMethodRepository.findOne.mockResolvedValue(mockPaymentMethod);

      const paymentMethod = await service.getPaymentMethodById('pm1');

      expect(paymentMethodRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'pm1' },
      });
      expect(paymentMethod).toEqual(mockPaymentMethod);
    });

    it('should return null when payment method not found', async () => {
      paymentMethodRepository.findOne.mockResolvedValue(null);

      const paymentMethod = await service.getPaymentMethodById('not-exist');

      expect(paymentMethod).toBeNull();
    });

    it('should return null when paymentMethodId is empty', async () => {
      const paymentMethod = await service.getPaymentMethodById('');

      expect(paymentMethodRepository.findOne).not.toHaveBeenCalled();
      expect(paymentMethod).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      paymentMethodRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      const paymentMethod = await service.getPaymentMethodById('pm1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching payment method pm1:',
        expect.any(Error),
      );
      expect(paymentMethod).toBeNull();

      loggerSpy.mockRestore();
    });
  });

  describe('getStoreById', () => {
    it('should return store when found', async () => {
      const mockStore = { store_id: 's1', name: 'Test Store' };
      storeRepository.findOne.mockResolvedValue(mockStore);

      const store = await service.getStoreById('s1');

      expect(storeRepository.findOne).toHaveBeenCalledWith({
        where: { store_id: 's1' },
      });
      expect(store).toEqual(mockStore);
    });

    it('should return null when store not found', async () => {
      storeRepository.findOne.mockResolvedValue(null);

      const store = await service.getStoreById('not-exist');

      expect(store).toBeNull();
    });

    it('should return null when storeId is empty', async () => {
      const store = await service.getStoreById('');

      expect(storeRepository.findOne).not.toHaveBeenCalled();
      expect(store).toBeNull();
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      storeRepository.findOne.mockRejectedValue(new Error('Database error'));

      const store = await service.getStoreById('s1');

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching store s1:',
        expect.any(Error),
      );
      expect(store).toBeNull();

      loggerSpy.mockRestore();
    });
  });

  describe('validateReferences', () => {
    it('should validate all references successfully', async () => {
      const mockUser = { user_id: 'u1', name: 'Test User' };
      const mockBank = { id: 'b1', name: 'Test Bank' };
      const mockUnit = { id: 'unit1', name: 'Test Unit' };
      const mockPaymentMethod = { id: 'pm1', name: 'Credit Card' };
      const mockStore = { store_id: 's1', name: 'Test Store' };

      userRepository.findOne.mockResolvedValue(mockUser);
      bankRepository.findOne.mockResolvedValue(mockBank);
      unitRepository.findOne.mockResolvedValue(mockUnit);
      paymentMethodRepository.findOne.mockResolvedValue(mockPaymentMethod);
      storeRepository.findOne.mockResolvedValue(mockStore);

      const result = await service.validateReferences({
        userId: 'u1',
        bankId: 'b1',
        unitId: 'unit1',
        paymentMethodId: 'pm1',
        storeId: 's1',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.bank).toEqual(mockBank);
      expect(result.data.unit).toEqual(mockUnit);
      expect(result.data.paymentMethod).toEqual(mockPaymentMethod);
      expect(result.data.store).toEqual(mockStore);
    });

    it('should return errors when some references not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      bankRepository.findOne.mockResolvedValue({ id: 'b1' });
      unitRepository.findOne.mockResolvedValue(null);
      paymentMethodRepository.findOne.mockResolvedValue({ id: 'pm1' });
      storeRepository.findOne.mockResolvedValue(null);

      const result = await service.validateReferences({
        userId: 'uX',
        bankId: 'b1',
        unitId: 'unitX',
        paymentMethodId: 'pm1',
        storeId: 'sX',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User not found: uX');
      expect(result.errors).toContain('Unit not found: unitX');
      expect(result.errors).toContain('Store not found: sX');
      expect(result.data.bank).toEqual({ id: 'b1' });
      expect(result.data.paymentMethod).toEqual({ id: 'pm1' });
    });

    it('should handle empty references object', async () => {
      const result = await service.validateReferences({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual({});
    });

    it('should handle partial references', async () => {
      const mockUser = { user_id: 'u1', name: 'Test User' };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateReferences({
        userId: 'u1',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data.user).toEqual(mockUser);
      expect(result.data.bank).toBeUndefined();
      expect(result.data.unit).toBeUndefined();
      expect(result.data.paymentMethod).toBeUndefined();
      expect(result.data.store).toBeUndefined();
    });
  });

  describe('getAllBanks', () => {
    it('should return all banks ordered by name', async () => {
      const mockBanks = [
        { id: 'b1', name: 'Bank A' },
        { id: 'b2', name: 'Bank B' },
      ];
      bankRepository.find.mockResolvedValue(mockBanks);

      const banks = await service.getAllBanks();

      expect(bankRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(banks).toEqual(mockBanks);
    });

    it('should return empty array when no banks found', async () => {
      bankRepository.find.mockResolvedValue([]);

      const banks = await service.getAllBanks();

      expect(banks).toEqual([]);
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      bankRepository.find.mockRejectedValue(new Error('Database error'));

      const banks = await service.getAllBanks();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching all banks:',
        expect.any(Error),
      );
      expect(banks).toEqual([]);

      loggerSpy.mockRestore();
    });
  });

  describe('getAllUnits', () => {
    it('should return all units ordered by name', async () => {
      const mockUnits = [
        { id: 'unit1', name: 'Unit A' },
        { id: 'unit2', name: 'Unit B' },
      ];
      unitRepository.find.mockResolvedValue(mockUnits);

      const units = await service.getAllUnits();

      expect(unitRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(units).toEqual(mockUnits);
    });

    it('should return empty array when no units found', async () => {
      unitRepository.find.mockResolvedValue([]);

      const units = await service.getAllUnits();

      expect(units).toEqual([]);
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      unitRepository.find.mockRejectedValue(new Error('Database error'));

      const units = await service.getAllUnits();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching all units:',
        expect.any(Error),
      );
      expect(units).toEqual([]);

      loggerSpy.mockRestore();
    });
  });

  describe('getAllPaymentMethods', () => {
    it('should return all payment methods ordered by name', async () => {
      const mockPaymentMethods = [
        { id: 'pm1', name: 'Credit Card' },
        { id: 'pm2', name: 'Cash' },
      ];
      paymentMethodRepository.find.mockResolvedValue(mockPaymentMethods);

      const paymentMethods = await service.getAllPaymentMethods();

      expect(paymentMethodRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(paymentMethods).toEqual(mockPaymentMethods);
    });

    it('should return empty array when no payment methods found', async () => {
      paymentMethodRepository.find.mockResolvedValue([]);

      const paymentMethods = await service.getAllPaymentMethods();

      expect(paymentMethods).toEqual([]);
    });

    it('should handle database error gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();
      paymentMethodRepository.find.mockRejectedValue(
        new Error('Database error'),
      );

      const paymentMethods = await service.getAllPaymentMethods();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error fetching all payment methods:',
        expect.any(Error),
      );
      expect(paymentMethods).toEqual([]);

      loggerSpy.mockRestore();
    });
  });
});
