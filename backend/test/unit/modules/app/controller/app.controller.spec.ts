import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/app.controller';
import { RedisCacheService } from 'src/common/cache/redis-cache.service';

// Mock các phụ thuộc
const mockDataSource = {
  isInitialized: true,
};

const mockRedisCacheService = {
  get: jest.fn().mockResolvedValue('ok'),
  getStats: jest.fn().mockResolvedValue({
    stats: {
      connected_clients: 1,
      used_memory: 1024,
      keyspace_hits: 10,
      keyspace_misses: 2,
    },
  }),
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: 'globalConnectionDataSource', useValue: mockDataSource },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getHello trả về thông báo API đang chạy', () => {
    expect(controller.getHello()).toBe('FarmHub Backend API is running!');
  });

  it('getHealth trả về trạng thái healthy', async () => {
    const result = await controller.getHealth();
    expect(result.status).toBe('healthy');
    expect(result.services.globalDatabase).toBe('connected');
    expect(result.services.redis).toBe('connected');
    expect(result.redis).toBeDefined();
  });

  it('getHealth trả về unhealthy khi globalDbHealthy = false', async () => {
    (mockDataSource as any).isInitialized = false;
    const result = await controller.getHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.services.globalDatabase).toBe('disconnected');
    (mockDataSource as any).isInitialized = true; // reset lại
  });

  it('getHealth trả về unhealthy khi Redis lỗi', async () => {
    mockRedisCacheService.get.mockRejectedValueOnce(new Error('Redis error'));
    const result = await controller.getHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.services.redis).toBe('disconnected');
    mockRedisCacheService.get.mockResolvedValue('ok'); // reset lại
  });

  it('getHealth trả về unhealthy khi throw ngoài cùng', async () => {
    const old = controller['globalDataSource'].isInitialized;
    Object.defineProperty(controller['globalDataSource'], 'isInitialized', {
      get() {
        throw new Error('DB error');
      },
    });
    const result = await controller.getHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.services.globalDatabase).toBe('error');
    Object.defineProperty(controller['globalDataSource'], 'isInitialized', {
      get() {
        return old;
      },
    });
  });

  it('getDatabaseHealth trả về trạng thái healthy', () => {
    const result = controller.getDatabaseHealth();
    expect(result.status).toBe('healthy');
    expect(result.globalDatabase).toBe('connected');
  });

  it('getDatabaseHealth trả về unhealthy khi throw exception', () => {
    const old = controller['globalDataSource'].isInitialized;
    Object.defineProperty(controller['globalDataSource'], 'isInitialized', {
      get() {
        throw new Error('DB error');
      },
    });
    const result = controller.getDatabaseHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.globalDatabase).toBe('error');
    Object.defineProperty(controller['globalDataSource'], 'isInitialized', {
      get() {
        return old;
      },
    });
  });

  it('getRedisHealth trả về trạng thái healthy', async () => {
    const result = await controller.getRedisHealth();
    expect(result.status).toBe('healthy');
    expect(result.redis).toBe('connected');
    expect(result.statistics).toBeDefined();
  });

  it('getRedisHealth trả về unhealthy khi Redis lỗi', async () => {
    mockRedisCacheService.get.mockRejectedValueOnce(new Error('Redis error'));
    const result = await controller.getRedisHealth();
    expect(result.status).toBe('unhealthy');
    expect(result.redis).toBe('disconnected');
    mockRedisCacheService.get.mockResolvedValue('ok'); // reset lại
  });

  it('getRedisHealth trả về statistics unavailable khi redisStats không có stats', async () => {
    mockRedisCacheService.getStats.mockResolvedValueOnce(null);
    const result = await controller.getRedisHealth();
    expect(result.status).toBe('healthy');
    expect(result.statistics).toBe('unavailable');
  });

  // Các endpoint có guard/role chỉ test khởi tạo, TODO: test guard/role thực tế
  it('getProfile trả về user từ request', () => {
    const req = { user: { id: '1', username: 'test', role: 'ADMIN_GLOBAL' } };
    expect(controller.getProfile(req as any)).toEqual(req.user);
  });

  it('getAdminData trả về dữ liệu admin', () => {
    const req = { user: { id: '1', username: 'admin', role: 'ADMIN_GLOBAL' } };
    expect(controller.getAdminData(req as any)).toEqual({
      message: 'This is admin-only data',
      user: req.user,
    });
  });

  it('getManagerData trả về dữ liệu manager', () => {
    const req = {
      user: { id: '2', username: 'manager', role: 'STORE_MANAGER' },
    };
    expect(controller.getManagerData(req as any)).toEqual({
      message: 'Manager data',
      user: req.user,
    });
  });

  it('getAllUsersData trả về dữ liệu cho user đã đăng nhập', () => {
    const req = { user: { id: '3', username: 'user', role: 'VIEWER' } };
    expect(controller.getAllUsersData(req as any)).toEqual({
      message: 'Data for all authenticated users',
      user: req.user,
    });
  });

  // TODO: Thêm test cho các trường hợp lỗi, guard, role thực tế nếu cần
});
