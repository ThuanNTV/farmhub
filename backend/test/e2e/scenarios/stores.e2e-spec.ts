import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';
import { Store } from '../../../src/entities/global/store.entity';

describe('Stores E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testStore = {
    schemaName: 'test-store-e2e',
    name: 'Test Store E2E',
    description: 'Test Store for E2E Tests',
    address: '123 E2E Test Street',
    phone: '0123456789',
    email: 'e2e@teststore.com',
    website: 'https://e2e.teststore.com',
    logo: '{"url": "e2e-logo.jpg"}',
  };

  const updateStoreData = {
    schemaName: 'test-store-e2e',
    name: 'Updated Test Store E2E',
    description: 'Updated Test Store for E2E Tests',
    phone: '0987654321',
    email: 'updated-e2e@teststore.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();
  });

  afterAll(async () => {
    // Clean up test database
    try {
      await dataSource.query(
        `DROP DATABASE IF EXISTS "${testStore.schemaName}"`,
      );
    } catch (error) {
      console.log('Database cleanup error:', error.message);
    }

    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await dataSource.query(
      `DELETE FROM store WHERE schema_name = '${testStore.schemaName}'`,
    );
  });

  describe('Store Management Flow', () => {
    it('should complete full store lifecycle', async () => {
      // 1. Create store
      const createResponse = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      expect(createResponse.body).toHaveProperty(
        'message',
        '✅ Tạo Store thành công',
      );
      expect(createResponse.body.data).toMatchObject({
        schema_name: testStore.schemaName,
        name: testStore.name,
        description: testStore.description,
        address: testStore.address,
        phone: testStore.phone,
        email: testStore.email,
        website: testStore.website,
        logo: testStore.logo,
        is_active: true,
        is_deleted: false,
      });

      const storeId = testStore.schemaName;

      // 2. Get all stores
      const getAllResponse = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(getAllResponse.body)).toBe(true);
      const createdStore = getAllResponse.body.find(
        (store: Store) => store.schema_name === storeId,
      );
      expect(createdStore).toBeDefined();

      // 3. Get store by ID
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/stores/${storeId}`)
        .expect(200);

      expect(getByIdResponse.body).toMatchObject({
        schema_name: storeId,
        name: testStore.name,
        email: testStore.email,
      });

      // 4. Update store
      const updateResponse = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send(updateStoreData)
        .expect(200);

      expect(updateResponse.body.message).toContain('đã được cập nhật');
      expect(updateResponse.body.data).toMatchObject({
        schema_name: storeId,
        name: updateStoreData.name,
        description: updateStoreData.description,
        phone: updateStoreData.phone,
        email: updateStoreData.email,
      });

      // 5. Verify update in database
      const updatedStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(updatedStore.name).toBe(updateStoreData.name);
      expect(updatedStore.email).toBe(updateStoreData.email);

      // 6. Deactivate store
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send({ ...updateStoreData, isActive: false })
        .expect(200);

      expect(deactivateResponse.body.data.is_active).toBe(false);

      // 7. Delete store
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/stores/${storeId}`)
        .expect(200);

      expect(deleteResponse.body.message).toContain('đã được xóa mềm');
      expect(deleteResponse.body.data).toBeNull();

      // 8. Verify soft delete
      const deletedStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(deletedStore.is_deleted).toBe(true);

      // 9. Restore store
      const restoreResponse = await request(app.getHttpServer())
        .post(`/stores/${storeId}/restore`)
        .expect(200);

      expect(restoreResponse.body.message).toBe('Khôi phục store thành công');
      expect(restoreResponse.body.data.is_deleted).toBe(false);

      // 10. Verify final state
      const finalStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(finalStore.is_deleted).toBe(false);
      expect(finalStore.name).toBe(updateStoreData.name);
    });
  });

  describe('Store Validation and Error Handling', () => {
    it('should handle validation errors properly', async () => {
      // Test invalid email
      const invalidStore = {
        ...testStore,
        schemaName: 'test-store-invalid-email',
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(invalidStore)
        .expect(400);

      expect(response.body.message).toContain('email');

      // Test missing required fields
      const incompleteStore = {
        schemaName: 'test-store-incomplete',
        // Missing name and other required fields
      };

      const incompleteResponse = await request(app.getHttpServer())
        .post('/stores')
        .send(incompleteStore)
        .expect(400);

      expect(incompleteResponse.body.message).toContain('name');
    });

    it('should handle duplicate schema name', async () => {
      // Create first store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should handle non-existent store operations', async () => {
      const nonExistentId = 'non-existent-store';

      // Try to get non-existent store
      const getResponse = await request(app.getHttpServer())
        .get(`/stores/${nonExistentId}`)
        .expect(404);

      expect(getResponse.body.message).toContain('không tồn tại');

      // Try to update non-existent store
      const updateResponse = await request(app.getHttpServer())
        .put(`/stores/${nonExistentId}`)
        .send(updateStoreData)
        .expect(404);

      expect(updateResponse.body.message).toContain('không tồn tại');

      // Try to delete non-existent store
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/stores/${nonExistentId}`)
        .expect(404);

      expect(deleteResponse.body.message).toContain('không tồn tại');
    });

    it('should handle schema name change restriction', async () => {
      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      // Try to change schema name
      const updateWithDifferentSchema = {
        ...updateStoreData,
        schemaName: 'different-schema-name',
      };

      const response = await request(app.getHttpServer())
        .put(`/stores/${testStore.schemaName}`)
        .send(updateWithDifferentSchema)
        .expect(409);

      expect(response.body.message).toContain('Không thể thay đổi schemaName');
    });
  });

  describe('Store Database Operations', () => {
    it('should persist data correctly across operations', async () => {
      // Create store
      const createResponse = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const storeId = testStore.schemaName;

      // Verify in database
      let dbStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(dbStore).toBeDefined();
      expect(dbStore.schema_name).toBe(storeId);
      expect(dbStore.name).toBe(testStore.name);

      // Update store
      await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send(updateStoreData)
        .expect(200);

      // Verify update in database
      dbStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(dbStore.name).toBe(updateStoreData.name);
      expect(dbStore.email).toBe(updateStoreData.email);

      // Delete store
      await request(app.getHttpServer())
        .delete(`/stores/${storeId}`)
        .expect(200);

      // Verify soft delete in database
      dbStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(dbStore.is_deleted).toBe(true);

      // Restore store
      await request(app.getHttpServer())
        .post(`/stores/${storeId}/restore`)
        .expect(200);

      // Verify restoration in database
      dbStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(dbStore.is_deleted).toBe(false);
    });

    it('should handle concurrent operations', async () => {
      const concurrentStore = {
        ...testStore,
        schemaName: 'concurrent-test-store',
      };

      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(concurrentStore)
        .expect(201);

      // Try to create duplicate concurrently
      const response = await request(app.getHttpServer())
        .post('/stores')
        .send(concurrentStore)
        .expect(409);

      expect(response.body.message).toContain('đã tồn tại');
    });
  });

  describe('Store Business Logic', () => {
    it('should handle store activation/deactivation', async () => {
      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const storeId = testStore.schemaName;

      // Deactivate store
      const deactivateResponse = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send({ ...updateStoreData, isActive: false })
        .expect(200);

      expect(deactivateResponse.body.data.is_active).toBe(false);

      // Verify in database
      const dbStore = await dataSource
        .getRepository(Store)
        .findOne({ where: { schema_name: storeId } });

      expect(dbStore.is_active).toBe(false);

      // Reactivate store
      const reactivateResponse = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send({ ...updateStoreData, isActive: true })
        .expect(200);

      expect(reactivateResponse.body.data.is_active).toBe(true);
    });

    it('should handle store contact information updates', async () => {
      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const storeId = testStore.schemaName;

      // Update contact information
      const contactUpdate = {
        schemaName: storeId,
        phone: '0987654321',
        email: 'newcontact@store.com',
        website: 'https://newstore.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send(contactUpdate)
        .expect(200);

      expect(response.body.data.phone).toBe('0987654321');
      expect(response.body.data.email).toBe('newcontact@store.com');
      expect(response.body.data.website).toBe('https://newstore.com');
    });

    it('should handle store logo updates', async () => {
      // Create store
      await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const storeId = testStore.schemaName;

      // Update logo
      const logoUpdate = {
        schemaName: storeId,
        logo: '{"url": "new-logo.jpg", "alt": "New Store Logo"}',
      };

      const response = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send(logoUpdate)
        .expect(200);

      expect(response.body.data.logo).toBe(
        '{"url": "new-logo.jpg", "alt": "New Store Logo"}',
      );
    });
  });

  describe('Store API Endpoints', () => {
    it('should handle all CRUD operations correctly', async () => {
      // CREATE
      const createResponse = await request(app.getHttpServer())
        .post('/stores')
        .send(testStore)
        .expect(201);

      const storeId = testStore.schemaName;

      // READ - Get all
      const getAllResponse = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(getAllResponse.body)).toBe(true);

      // READ - Get by ID
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/stores/${storeId}`)
        .expect(200);

      expect(getByIdResponse.body.schema_name).toBe(storeId);

      // UPDATE
      const updateResponse = await request(app.getHttpServer())
        .put(`/stores/${storeId}`)
        .send(updateStoreData)
        .expect(200);

      expect(updateResponse.body.data.name).toBe(updateStoreData.name);

      // DELETE
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/stores/${storeId}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();

      // RESTORE
      const restoreResponse = await request(app.getHttpServer())
        .post(`/stores/${storeId}/restore`)
        .expect(200);

      expect(restoreResponse.body.data.is_deleted).toBe(false);
    });

    it('should handle store search and filtering', async () => {
      // Create multiple stores
      const store1 = { ...testStore, schemaName: 'store1', name: 'Store One' };
      const store2 = { ...testStore, schemaName: 'store2', name: 'Store Two' };

      await request(app.getHttpServer())
        .post('/stores')
        .send(store1)
        .expect(201);

      await request(app.getHttpServer())
        .post('/stores')
        .send(store2)
        .expect(201);

      // Get all stores
      const response = await request(app.getHttpServer())
        .get('/stores')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Verify both stores are active
      const activeStores = response.body.filter(
        (store: Store) =>
          store.schema_name === 'store1' || store.schema_name === 'store2',
      );
      expect(activeStores.length).toBe(2);
      expect(activeStores.every((store: Store) => store.is_active)).toBe(true);
    });
  });
});
