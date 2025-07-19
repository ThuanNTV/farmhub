import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../service/products.service';

const mockProductsService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ReturnType<typeof mockProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useFactory: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all products', async () => {
    service.findAll.mockResolvedValue(['test']);
    expect(await controller.findAll('store1')).toEqual(['test']);
    expect(service.findAll).toHaveBeenCalledWith('store1');
  });

  it('should return one product', async () => {
    service.findOne.mockResolvedValue({ id: 1 });
    expect(await controller.findOne('store1', '1')).toEqual({ id: 1 });
    expect(service.findOne).toHaveBeenCalledWith('store1', '1');
  });

  it('should create a product', async () => {
    service.create.mockResolvedValue({ id: 1 });
    expect(await controller.create('store1', { name: 'test' } as any)).toEqual({
      id: 1,
    });
    expect(service.create).toHaveBeenCalled();
  });

  it('should update a product', async () => {
    service.update.mockResolvedValue({ id: 1 });
    expect(
      await controller.update('store1', '1', { name: 'test' } as any),
    ).toEqual({ id: 1 });
    expect(service.update).toHaveBeenCalled();
  });

  it('should remove a product', async () => {
    service.remove.mockResolvedValue({ id: 1 });
    expect(await controller.remove('store1', '1')).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalled();
  });
});
