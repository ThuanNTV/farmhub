import { Test, TestingModule } from '@nestjs/testing';
import { InventoryTransactionService } from './inventory-transaction.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('InventoryTransactionService', () => {
  let service: InventoryTransactionService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTransactionService,
        {
          provide: TenantDataSourceService,
          useValue: { getRepo: jest.fn().mockResolvedValue(mockRepo()) },
        },
      ],
    }).compile();

    service = module.get<InventoryTransactionService>(
      InventoryTransactionService,
    );
    repo = await service.getRepo('store1');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll', async () => {
    repo.find.mockResolvedValue([]);
    const result = await service.findAll('store1');
    expect(result).toEqual([]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should call findOne', async () => {
    repo.findOne.mockResolvedValue({ id: 1 });
    const result = await service.findOne('store1', 1);
    expect(result).toEqual({ id: 1 });
    expect(repo.findOne).toHaveBeenCalled();
  });
});
