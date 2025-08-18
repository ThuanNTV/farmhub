import { Test, TestingModule } from '@nestjs/testing';
import { DashboardAnalyticsController } from '@modules/dashboard-analytics/controller/dashboard-analytics.controller';
import { DashboardAnalyticsService } from '@modules/dashboard-analytics/service/dashboard-analytics.service';

describe('DashboardAnalyticsController', () => {
  let controller: DashboardAnalyticsController;

  const mockService: Partial<Record<keyof DashboardAnalyticsService, jest.Mock>> = {
    getHeatmap: jest.fn(),
    getChart: jest.fn(),
    getIndustryAnalytics: jest.fn(),
    getTrend: jest.fn(),
    getTopCustomers: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardAnalyticsController],
      providers: [
        { provide: DashboardAnalyticsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<DashboardAnalyticsController>(
      DashboardAnalyticsController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('successful operations', () => {
    it('should handle request successfully', async () => {
      // Test successful scenario
      mockService.getTrend!.mockResolvedValueOnce({ trend: [] });
      const res = controller.getTrend('store-1', '2025-01-01', '2025-01-31');
      await expect(res).resolves.toEqual({ trend: [] });
    });
  });

  describe('error handling', () => {
    it('should handle error scenario', async () => {
      // Test error scenario
      mockService.getTrend!.mockRejectedValueOnce(new Error('boom'));
      await expect(
        controller.getTrend('store-1', '2025-01-01', '2025-01-31'),
      ).rejects.toThrow('boom');
    });
  });
});
