import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { AuditLogsService } from 'src/modules/audit-logs/service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  merge: jest.fn(),
});

const mockAuditLogsService = () => ({
  create: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: ReturnType<typeof mockRepo>;
  let auditLogsService: ReturnType<typeof mockAuditLogsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: TenantDataSourceService,
          useValue: { getRepo: jest.fn().mockResolvedValue(mockRepo()) },
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = await service.getRepo('store1');
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create product successfully', async () => {
    const dto: CreateProductDto = {
      productId: 'p1',
      productCode: 'C1',
      createdByUserId: 'u1',
    } as any;
    repo.findOneBy.mockResolvedValueOnce(null); // findById
    repo.findOneBy.mockResolvedValueOnce(null); // findByproductCode
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue({ ...dto, product_id: 'p1' });
    auditLogsService.create.mockResolvedValue({});
    const result = await service.createProduct('store1', dto);
    expect(result.product_id).toBe('p1');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('should throw error if productId exists', async () => {
    const dto: CreateProductDto = { productId: 'p1', productCode: 'C1' } as any;
    repo.findOneBy.mockResolvedValueOnce({ product_id: 'p1' }); // findById
    await expect(service.createProduct('store1', dto)).rejects.toThrow();
  });

  it('should throw error if productCode exists', async () => {
    const dto: CreateProductDto = { productId: 'p1', productCode: 'C1' } as any;
    repo.findOneBy.mockResolvedValueOnce(null); // findById
    repo.findOneBy.mockResolvedValueOnce({ product_code: 'C1' }); // findByproductCode
    await expect(service.createProduct('store1', dto)).rejects.toThrow();
  });

  it('should update product successfully', async () => {
    const dto: UpdateProductDto = {
      productCode: 'C2',
      updatedByUserId: 'u2',
    } as any;
    const product = { product_id: 'p1', productCode: 'C1' };
    repo.findOneBy.mockResolvedValueOnce(product); // findByproductCode
    repo.findOneBy.mockResolvedValueOnce(null); // findByproductCode (no duplicate)
    repo.merge.mockReturnValue({ ...product, ...dto });
    repo.save.mockResolvedValue({ ...product, ...dto });
    auditLogsService.create.mockResolvedValue({});
    // Mock findOneProduc
    service.findOneProduc = jest.fn().mockResolvedValue({ repo, product });
    const result = await service.update('store1', 'p1', dto);
    expect(result.productCode).toBe('C2');
    expect(repo.merge).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('should remove product successfully', async () => {
    const product = { product_id: 'p1', updated_by_user_id: 'u2' };
    repo.save.mockResolvedValue({ ...product, is_deleted: true });
    auditLogsService.create.mockResolvedValue({});
    service.findOneProduc = jest.fn().mockResolvedValue({ repo, product });
    const result = await service.remove('store1', 'p1');
    expect(result.message).toContain('đã được xóa');
    expect(repo.save).toHaveBeenCalled();
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('should restore product successfully', async () => {
    const entity = {
      product_id: 'p1',
      is_deleted: true,
      updated_by_user_id: 'u2',
    };
    repo.findOne.mockResolvedValue(entity);
    repo.save.mockResolvedValue({ ...entity, is_deleted: false });
    auditLogsService.create.mockResolvedValue({});
    const result = await service.restore('store1', 'p1');
    expect(result.message).toContain('Khôi phục sản phẩm thành công');
    expect(repo.save).toHaveBeenCalled();
    expect(auditLogsService.create).toHaveBeenCalled();
  });
});
