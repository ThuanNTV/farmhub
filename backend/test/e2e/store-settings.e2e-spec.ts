import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { EnhancedAuthGuard } from '../../src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from '../../src/core/rbac/permission/permission.guard';

// Minimal e2e coverage for store-settings routing

describe('StoreSettings (e2e)', () => {
  let app: INestApplication;
  const storeId = 'store-001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tenant/:storeId/store-settings should 200', async () => {
    await request(app.getHttpServer())
      .get(`/tenant/${storeId}/store-settings`)
      .expect(200);
  });
});
