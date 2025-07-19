/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { SecurityService } from 'src/service/global/security.service';
import { BankController } from 'src/modules/bank/controller/bank.controller';
import { BankService } from 'src/modules/bank/service/bank.service';
import { Bank } from 'src/entities/global/bank.entity';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import {
  mockAuditLogAsyncService,
  mockReflector,
  mockEnhancedAuthGuard,
  mockPermissionGuard,
  mockAuditInterceptor,
} from '../../../../utils/mock-dependencies';

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

const fixedDate = new Date('2025-07-19T15:54:24.960Z');
const createMockBank = (overrides: Partial<Bank> = {}): Bank => ({
  id: 'BANK001',
  name: 'Test Bank',
  created_at: fixedDate,
  updated_at: fixedDate,
  created_by_user_id: 'USER001',
  is_deleted: false,
  ...overrides,
});

describe('BankController', () => {
  let controller: BankController;
  let service: BankService;
  const req = { user: { userId: 'user1' } } as unknown as Request & {
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
        { provide: AuditLogAsyncService, useValue: mockAuditLogAsyncService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnhancedAuthGuard, useValue: mockEnhancedAuthGuard },
        { provide: PermissionGuard, useValue: mockPermissionGuard },
        { provide: AuditInterceptor, useValue: mockAuditInterceptor },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockEnhancedAuthGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockPermissionGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue(mockAuditInterceptor)
      .compile();

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
    await expect(controller.create(dto, req as any)).resolves.toEqual(createMockBank());
    expect(service.create).toHaveBeenCalledWith(dto, 'user1');
  });

  it('should get all banks', async () => {
    const mockBanks = [createMockBank()];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockBanks);
    await expect(controller.findAll()).resolves.toEqual(mockBanks);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get one bank', async () => {
    const mockBank = createMockBank();
    jest.spyOn(service, 'findOne').mockResolvedValue(mockBank);
    await expect(controller.findOne('BANK001')).resolves.toEqual(mockBank);
    expect(service.findOne).toHaveBeenCalledWith('BANK001');
  });

  it('should update a bank', async () => {
    const dto = { name: 'Updated Bank' };
    const mockBank = createMockBank({ name: 'Updated Bank' });
    jest
      .spyOn(service, 'update')
      .mockResolvedValue(mockBank);
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
