import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UnitsController } from 'src/modules/units/controller/units.controller';
import { UnitsService } from 'src/modules/units/service/units.service';
// Imports kept for path resolution via moduleNameMapper; concrete classes are mocked below

// No-op rate limit decorator to avoid side effects
jest.mock('src/common/decorator/rate-limit.decorator', () => ({
  RateLimitAPI: jest.fn().mockReturnValue(() => {}),
}));

// Mock interceptor to a no-op class with zero constructor deps
jest.mock('src/common/auth/audit.interceptor', () => ({
  AuditInterceptor: class {
    intercept(_ctx: any, next: any) {
      return next.handle();
    }
  },
}));

// Mock guards to always allow and have no constructor deps
jest.mock('src/common/auth/enhanced-auth.guard', () => ({
  EnhancedAuthGuard: class {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('src/core/rbac/permission/permission.guard', () => ({
  PermissionGuard: class {
    canActivate() {
      return true;
    }
  },
}));

describe('UnitsController (light e2e)', () => {
  let app: INestApplication;

  const mockUnitsService = {
    findAll: async () => [],
    findAllWithFilter: async () => ({ data: [], total: 0, page: 1, limit: 5 }),
    mapToResponseDto: (e: any) => ({
      id: e?.id || 'id',
      name: e?.name || 'name',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      createdByUserId: 'user-1',
      updatedByUserId: 'user-1',
    }),
  } as unknown as UnitsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [{ provide: UnitsService, useValue: mockUnitsService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Extra safety: add a global no-op interceptor (redundant due to jest.mock but harmless)
    app.useGlobalInterceptors({
      intercept: (_ctx: any, next: any) => next.handle(),
    } as any);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /units should return 200', async () => {
    const res = await request(app.getHttpServer()).get('/units').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /units/search should return paginated object', async () => {
    const res = await request(app.getHttpServer())
      .get('/units/search?page=1&limit=5&search=kg')
      .expect(200);
    expect(res.body).toMatchObject({
      data: expect.any(Array),
      total: 0,
      page: 1,
      limit: 5,
    });
  });
});
