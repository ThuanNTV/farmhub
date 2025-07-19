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
  let mockRepository: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    mockRepository = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryTransactionService,
        {
          provide: TenantDataSourceService,
          useValue: { getRepo: jest.fn().mockResolvedValue(mockRepository) },
        },
      ],
    }).compile();

    service = module.get<InventoryTransactionService>(
      InventoryTransactionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findAll', async () => {
    mockRepository.find.mockResolvedValue([]);
    const result = await service.findAll('store1');
    expect(result).toEqual([]);
    expect(mockRepository.find).toHaveBeenCalled();
  });

  it('should call findOne', async () => {
    mockRepository.findOne.mockResolvedValue({ id: 1 });
    const result = await service.findOne('store1', 1);
    expect(result).toEqual({ id: 1 });
    expect(mockRepository.findOne).toHaveBeenCalled();
  });
});
