import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsService } from '@modules/promotions/service/promotions.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Promotion, PromotionType } from 'src/entities/tenant/promotion.entity';
import {
  createTenantServiceTestSetup,
  TenantServiceTestSetup,
  TEST_STORE_ID,
  resetMocks,
  setupSuccessfulRepositoryMocks,
} from '../../../../utils/tenant-datasource-mock.util';

describe('PromotionsService', () => {
  let module: TestingModule;
  let service: PromotionsService;
  let setup: TenantServiceTestSetup<Promotion>;

  const mockPromotionData: Partial<Promotion> = {
    id: 'promotion-123',
    name: 'Test Promotion',
    type: PromotionType.PERCENTAGE,
    value: '10',
    applies_to: 'all',
    start_date: new Date(),
    end_date: new Date(),
    is_active: true,
  };

  beforeEach(async () => {
    setup = createTenantServiceTestSetup<Promotion>();

    module = await Test.createTestingModule({
      providers: [
        PromotionsService,
        {
          provide: TenantDataSourceService,
          useValue: setup.mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
  });

  afterEach(async () => {
    resetMocks(setup);
    await module.close();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have correct primary key', () => {
      expect((service as any).primaryKey).toBe('id');
    });
  });

  describe('create', () => {
    it('should create promotion successfully', async () => {
      const entityData: any = {
        name: 'Test Promotion',
        type: 'percentage',
        value: '10',
        applies_to: 'all',
        start_date: new Date(),
        end_date: new Date(),
        is_active: true,
      };

      const expectedPromotion = { ...mockPromotionData, ...entityData };
      setupSuccessfulRepositoryMocks(
        setup.mockRepository,
        expectedPromotion as Promotion,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await service.create(TEST_STORE_ID, entityData);

      expect(
        setup.mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(TEST_STORE_ID);
      expect(setup.mockRepository.create).toHaveBeenCalled();
      expect(setup.mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedPromotion);
    });

    it('should transform string type to enum', async () => {
      const entityData: any = {
        name: 'Test Promotion',
        type: 'percentage',
        value: '10',
      };

      const expectedPromotion = {
        ...mockPromotionData,
        type: PromotionType.PERCENTAGE,
      };
      setupSuccessfulRepositoryMocks(
        setup.mockRepository,
        expectedPromotion as Promotion,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await service.create(TEST_STORE_ID, entityData);

      // Verify that the type was transformed to enum value
      const createCall = setup.mockRepository.create.mock.calls[0][0];
      expect(createCall.type).toBe(PromotionType.PERCENTAGE);
    });

    it('should handle service errors', async () => {
      const entityData: any = {
        name: 'Test Promotion',
        type: 'percentage',
        value: '10',
      };

      setup.mockTenantDataSourceService.getTenantDataSource.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(service.create(TEST_STORE_ID, entityData)).rejects.toThrow();
    });
  });
});
