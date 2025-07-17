/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BankController } from '../../../src/modules/bank/controller/bank.controller';
import { BankService } from '../../../src/modules/bank/service/bank.service';
import { Request } from 'express';
import { SecurityService } from 'src/service/global/security.service';
import { Bank } from 'src/entities/global/bank.entity';

const mockBank = {
  id: 'BANK001',
  name: 'Test Bank',
  created_at: new Date(),
  updated_at: new Date(),
  created_by_user_id: 'user1',
  is_deleted: false,
};

const mockBanks = [mockBank];

const mockService = {
  create: jest.fn().mockResolvedValue(mockBank),
  findAll: jest.fn().mockResolvedValue(mockBanks),
  findOne: jest.fn().mockResolvedValue(mockBank),
  update: jest.fn().mockResolvedValue(mockBank),
  remove: jest.fn().mockResolvedValue({ message: 'Đã xóa bank', data: null }),
};

let mockSecurityService: jest.Mocked<SecurityService>;

const createMockBank = (overrides: Partial<Bank> = {}): Bank => ({
  id: 'BANK001',
  name: 'Test Bank',
  created_at: new Date(),
  updated_at: new Date(),
  created_by_user_id: 'USER001',
  is_deleted: false,
  ...overrides,
});

describe('BankController', () => {
  let controller: BankController;
  let service: BankService;
  const req = { user: { userId: 'user-123' } } as unknown as Request & {
    user: { userId: string };
  };

  beforeEach(async () => {
    mockSecurityService = {
      validateToken: jest.fn(),
      hasPermission: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankController],
      providers: [
        { provide: BankService, useValue: mockService },
        { provide: SecurityService, useValue: mockSecurityService },
      ],
    }).compile();

    controller = module.get<BankController>(BankController);
    service = module.get<BankService>(BankService);

    jest.spyOn(service, 'create').mockImplementation((dto, userId) => {
      return Promise.resolve(mockService.create(dto, userId));
    });
    jest.spyOn(service, 'findAll').mockImplementation(() => {
      return Promise.resolve(mockService.findAll());
    });
    jest.spyOn(service, 'findOne').mockImplementation((id) => {
      return Promise.resolve(mockService.findOne(id));
    });
    jest.spyOn(service, 'update').mockImplementation((id, dto, userId) => {
      return Promise.resolve(mockService.update(id, dto, userId));
    });
    jest.spyOn(service, 'remove').mockImplementation((id, userId) => {
      return Promise.resolve(mockService.remove(id, userId));
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a bank', async () => {
    const dto = { name: 'Test Bank' };

    jest.spyOn(service, 'create').mockResolvedValue(createMockBank());

    await expect(controller.create(dto, req as any)).resolves.toEqual(
      createMockBank,
    );
    expect(service.create).toHaveBeenCalledWith(dto, 'user1');
  });

  it('should get all banks', async () => {
    const mockBanks = [{ id: 'BANK001', name: 'Test Bank' }];

    jest.spyOn(service, 'findAll').mockResolvedValue([createMockBank()]);

    await expect(controller.findAll()).resolves.toEqual(mockBanks);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get one bank', async () => {
    const mockBank = { id: 'BANK001', name: 'Test Bank' };

    jest.spyOn(service, 'findOne').mockResolvedValue(createMockBank());

    await expect(controller.findOne('BANK001')).resolves.toEqual(mockBank);
    expect(service.findOne).toHaveBeenCalledWith('BANK001');
  });

  it('should update a bank', async () => {
    const dto = { name: 'Updated Bank' };
    const mockBank = { id: 'BANK001', name: 'Updated Bank' };

    jest
      .spyOn(service, 'update')
      .mockResolvedValue(createMockBank({ name: 'Updated Bank' }));

    await expect(
      controller.update('BANK001', dto, req as any),
    ).resolves.toEqual(mockBank);
    expect(service.update).toHaveBeenCalledWith('BANK001', dto, 'user1');
  });

  it('should remove a bank', async () => {
    jest
      .spyOn(service, 'remove')
      .mockResolvedValue({ message: 'Đã xóa bank', data: null });

    await expect(controller.remove('BANK001', req as any)).resolves.toEqual({
      message: 'Đã xóa bank',
    });
    expect(service.remove).toHaveBeenCalledWith('BANK001', 'user1');
  });
});
