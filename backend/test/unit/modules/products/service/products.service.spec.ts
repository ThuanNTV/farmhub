import { ProductsService } from 'src/modules/products/service/products.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let superGetRepo: jest.SpyInstance;
  let superFindById: jest.SpyInstance;
  let repo: any;
  let auditLogsService: any;

  beforeEach(() => {
    repo = {
      findOneBy: jest.fn(),
      find: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn(),
      merge: jest.fn((a, b) => ({ ...a, ...b })),
    };
    auditLogsService = {
      create: jest.fn(),
    };
    service = new ProductsService({} as any, auditLogsService);
    superGetRepo = jest
      .spyOn(ProductsService.prototype, 'getRepo')
      .mockResolvedValue(repo);
    superFindById = jest
      .spyOn(ProductsService.prototype, 'findById')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // createProduct
  it('createProduct throw nếu đã tồn tại productId', async () => {
    superFindById.mockResolvedValue({ product_id: 'p1' });
    await expect(
      service.createProduct('store1', {
        productId: 'p1',
        productCode: 'c1',
      } as any),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('createProduct throw nếu đã tồn tại productCode', async () => {
    superFindById.mockResolvedValue(null);
    jest
      .spyOn(service, 'findByproductCode')
      .mockResolvedValue({ product_id: 'p2' });
    await expect(
      service.createProduct('store1', {
        productId: 'p1',
        productCode: 'c1',
      } as any),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('createProduct trả về đúng product khi hợp lệ', async () => {
    superFindById.mockResolvedValue(null);
    jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
    repo.save.mockResolvedValue({ product_id: 'p1' });
    const result = await service.createProduct('store1', {
      productId: 'p1',
      productCode: 'c1',
      createdByUserId: 'u1',
    } as any);
    expect(result.product_id).toBe('p1');
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('createProduct throw nếu repo.save lỗi', async () => {
    superFindById.mockResolvedValue(null);
    jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
    repo.save.mockRejectedValue(new Error('fail'));
    await expect(
      service.createProduct('store1', {
        productId: 'p1',
        productCode: 'c1',
        createdByUserId: 'u1',
      } as any),
    ).rejects.toThrow('fail');
  });

  // findById
  it('findById trả về đúng product', async () => {
    repo.findOneBy.mockResolvedValue({ product_id: 'p1' });
    const result = await service.findById('store1', 'p1');
    expect(result.product_id).toBe('p1');
  });

  // findByproductCode
  it('findByproductCode trả về đúng product', async () => {
    repo.findOneBy.mockResolvedValue({ product_code: 'c1' });
    const result = await service.findByproductCode('store1', 'c1');
    expect(result.product_code).toBe('c1');
  });

  // findOne
  it('findOne throw nếu không tìm thấy', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('store1', 'p1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne trả về đúng product', async () => {
    repo.findOneBy.mockResolvedValue({ product_id: 'p1' });
    const result = await service.findOne('store1', 'p1');
    expect(result.product_id).toBe('p1');
  });

  it('findOne throw nếu repo.findOneBy lỗi', async () => {
    repo.findOneBy.mockRejectedValue(new Error('fail'));
    await expect(service.findOne('store1', 'p1')).rejects.toThrow('fail');
  });

  // findOneProduc
  it('findOneProduc throw nếu không tìm thấy', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOneProduc('store1', 'p1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOneProduc trả về đúng {repo, product}', async () => {
    repo.findOneBy.mockResolvedValue({ product_id: 'p1' });
    const result = await service.findOneProduc('store1', 'p1');
    expect(result.product.product_id).toBe('p1');
    expect(result.repo).toBe(repo);
  });

  // findAll
  it('findAll trả về đúng products', async () => {
    repo.find.mockResolvedValue([{ product_id: 'p1' }, { product_id: 'p2' }]);
    const result = await service.findAll('store1');
    expect(result.length).toBe(2);
  });

  it('findAll throw nếu repo.find lỗi', async () => {
    repo.find.mockRejectedValue(new Error('fail'));
    await expect(service.findAll('store1')).rejects.toThrow('fail');
  });

  // update
  it('update throw nếu không tìm thấy product', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockRejectedValue(new NotFoundException());
    await expect(service.update('store1', 'p1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update throw nếu productCode đã tồn tại và khác productId', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockResolvedValue({ repo, product: { product_id: 'p1' } });
    jest
      .spyOn(service, 'findByproductCode')
      .mockResolvedValue({ product_id: 'p2' });
    await expect(
      service.update('store1', 'p1', { productCode: 'c1' } as any),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('update trả về đúng product khi hợp lệ', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockResolvedValue({ repo, product: { product_id: 'p1' } });
    jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
    repo.save.mockResolvedValue({ product_id: 'p1' });
    const result = await service.update('store1', 'p1', {
      productCode: 'c1',
      updatedByUserId: 'u1',
    } as any);
    expect(result.product_id).toBe('p1');
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('update throw nếu repo.save lỗi', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockResolvedValue({ repo, product: { product_id: 'p1' } });
    jest.spyOn(service, 'findByproductCode').mockResolvedValue(null);
    repo.save.mockRejectedValue(new Error('fail'));
    await expect(
      service.update('store1', 'p1', {
        productCode: 'c1',
        updatedByUserId: 'u1',
      } as any),
    ).rejects.toThrow('fail');
  });

  // remove
  it('remove throw nếu không tìm thấy product', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockRejectedValue(new NotFoundException());
    await expect(service.remove('store1', 'p1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove trả về đúng message khi hợp lệ', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockResolvedValue({
        repo,
        product: { product_id: 'p1', updated_by_user_id: 'u1' },
      });
    repo.save.mockResolvedValue({ product_id: 'p1' });
    const result = await service.remove('store1', 'p1');
    expect(result.message).toContain('đã được xóa');
    expect(auditLogsService.create).toHaveBeenCalled();
  });

  it('remove throw nếu repo.save lỗi', async () => {
    jest
      .spyOn(service, 'findOneProduc')
      .mockResolvedValue({
        repo,
        product: { product_id: 'p1', updated_by_user_id: 'u1' },
      });
    repo.save.mockRejectedValue(new Error('fail'));
    await expect(service.remove('store1', 'p1')).rejects.toThrow('fail');
  });
});
