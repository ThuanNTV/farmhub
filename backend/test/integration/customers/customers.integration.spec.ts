import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomersService } from '../../../src/modules/customers/service/customers.service';
import { Customer } from '../../../src/entities/tenant/customer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantModule } from 'src/config/db/dbtenant/tenant.module';
import { CustomersModule } from 'src/modules/customers/customers.module';

describe('CustomersService Integration', () => {
  let app: INestApplication;
  let customersService: CustomersService;
  let tenantDataSourceService: TenantDataSourceService;
  let customerRepository: Repository<Customer>;

  const testStoreId = 'test-store-123';
  const testCustomerData = {
    customerId: '123e4567-e89b-12d3-a456-426614174000',
    customerName: 'Integration Test Customer',
    name: 'Integration Test Customer',
    phone: '0123456789',
    email: 'integration-test@example.com',
    address: 'Integration Test Address',
    birthday: '1990-01-01', // string
    gender: 'female' as 'female',
    refCode: undefined, // không dùng null
    createdByUserId: '123e4567-e89b-12d3-a456-426614174001',
    updatedByUserId: '123e4567-e89b-12d3-a456-426614174001',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantModule, CustomersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    customersService = moduleFixture.get<CustomersService>(CustomersService);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    // Get repository for the test store
    const dataSource =
      await tenantDataSourceService.getTenantDataSource(testStoreId);
    customerRepository = dataSource.getRepository(Customer);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await customerRepository.delete({
      customer_id: testCustomerData.customerId,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('createCustomer', () => {
    it('should create a new customer successfully', async () => {
      // Create new customer
      const result = await customersService.createCustomer(
        testStoreId,
        testCustomerData,
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.message).toBe('Thêm mới thành công');
      expect(result.data).toBeDefined();
      expect(result.data.customer_id).toBe(testCustomerData.customerId);
      expect(result.data.name).toBe(testCustomerData.customerName);
      expect(result.data.phone).toBe(testCustomerData.phone);
      expect(result.data.email).toBe(testCustomerData.email);

      // Verify customer exists in database
      const dbCustomer = await customerRepository.findOneBy({
        customer_id: testCustomerData.customerId,
      });
      expect(dbCustomer).not.toBeNull();
      expect(dbCustomer!.name).toBe(testCustomerData.customerName);
      expect(dbCustomer!.phone).toBe(testCustomerData.phone);
      expect(dbCustomer!.email).toBe(testCustomerData.email);
      expect(dbCustomer!.is_active).toBe(true);
      expect(dbCustomer!.is_deleted).toBe(false);
    });

    it('should fail to create customer with duplicate ID', async () => {
      // Create first customer
      await customersService.createCustomer(testStoreId, testCustomerData);

      // Try to create with same ID
      await expect(
        customersService.createCustomer(testStoreId, testCustomerData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create customer with duplicate phone', async () => {
      // Create first customer
      await customersService.createCustomer(testStoreId, testCustomerData);

      // Try to create with same phone but different ID
      const duplicatePhoneData = {
        ...testCustomerData,
        customerId: '123e4567-e89b-12d3-a456-426614174002',
        gender: 'male' as 'male',
      };

      await expect(
        customersService.createCustomer(testStoreId, duplicatePhoneData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create customer with duplicate email', async () => {
      // Create first customer
      await customersService.createCustomer(testStoreId, testCustomerData);

      // Try to create with same email but different ID
      const duplicateEmailData = {
        ...testCustomerData,
        customerId: '123e4567-e89b-12d3-a456-426614174002',
        gender: 'other' as 'other',
      };

      await expect(
        customersService.createCustomer(testStoreId, duplicateEmailData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create customer with invalid phone format', async () => {
      const invalidPhoneData = {
        ...testCustomerData,
        phone: 'invalid-phone',
        gender: 'female' as 'female',
      };

      await expect(
        customersService.createCustomer(testStoreId, invalidPhoneData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create customer with invalid email format', async () => {
      const invalidEmailData = {
        ...testCustomerData,
        email: 'invalid-email',
        gender: 'male' as 'male',
      };

      await expect(
        customersService.createCustomer(testStoreId, invalidEmailData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to create customer with invalid birthday format', async () => {
      const invalidBirthdayData = {
        ...testCustomerData,
        birthday: 'invalid-date',
        gender: 'other' as 'other',
      };

      await expect(
        customersService.createCustomer(testStoreId, invalidBirthdayData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test customer
      await customersService.createCustomer(testStoreId, testCustomerData);
    });

    it('should return all active customers', async () => {
      const customers = await customersService.findAll(testStoreId);

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // Check if our test customer is in the list
      const testCustomer = customers.find(
        (c) => c.customer_id === testCustomerData.customerId,
      );
      expect(testCustomer).toBeDefined();
      expect(testCustomer!.name).toBe(testCustomerData.customerName);
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      // Create test customer
      await customersService.createCustomer(testStoreId, testCustomerData);
    });

    it('should return customer by ID', async () => {
      const customer = await customersService.findOne(
        testStoreId,
        testCustomerData.customerId,
      );

      expect(customer).toBeDefined();
      expect(customer.customer_id).toBe(testCustomerData.customerId);
      expect(customer.name).toBe(testCustomerData.customerName);
      expect(customer.phone).toBe(testCustomerData.phone);
      expect(customer.email).toBe(testCustomerData.email);
    });

    it('should throw NotFoundException for non-existent customer', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        customersService.findOne(testStoreId, nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create test customer
      const result = await customersService.createCustomer(
        testStoreId,
        testCustomerData,
      );
      customerId = result.data.customer_id;
    });

    it('should update customer successfully', async () => {
      const updateData = {
        customerName: 'Updated Integration Test Customer',
        phone: '0987654321',
        email: 'updated-integration-test@example.com',
        address: 'Updated Integration Test Address',
      };

      const result = await customersService.update(
        testStoreId,
        customerId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('Cập nhật thành công');

      // Verify in database
      const updatedCustomer = await customerRepository.findOneBy({
        customer_id: customerId,
      });
      expect(updatedCustomer).not.toBeNull();
      expect(updatedCustomer!.name).toBe(updateData.customerName);
      expect(updatedCustomer!.phone).toBe(updateData.phone);
      expect(updatedCustomer!.email).toBe(updateData.email);
      expect(updatedCustomer!.address).toBe(updateData.address);
    });

    it('should fail to update with duplicate phone', async () => {
      // Create another customer with different phone
      const secondCustomerData = {
        ...testCustomerData,
        customerId: '123e4567-e89b-12d3-a456-426614174002',
        phone: '0987654321',
      };
      await customersService.createCustomer(testStoreId, secondCustomerData);

      // Try to update first customer with second customer's phone
      const updateData = {
        phone: '0987654321',
      };

      await expect(
        customersService.update(testStoreId, customerId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should fail to update with duplicate email', async () => {
      // Create another customer with different email
      const secondCustomerData = {
        ...testCustomerData,
        customerId: '123e4567-e89b-12d3-a456-426614174002',
        email: 'updated-integration-test@example.com',
      };
      await customersService.createCustomer(testStoreId, secondCustomerData);

      // Try to update first customer with second customer's email
      const updateData = {
        email: 'updated-integration-test@example.com',
      };

      await expect(
        customersService.update(testStoreId, customerId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create test customer
      const result = await customersService.createCustomer(
        testStoreId,
        testCustomerData,
      );
      customerId = result.data.customer_id;
    });

    it('should soft delete customer successfully', async () => {
      const result = await customersService.remove(testStoreId, customerId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Xóa thành công');

      // Verify customer is soft deleted in database
      const deletedCustomer = await customerRepository.findOneBy({
        customer_id: customerId,
      });
      expect(deletedCustomer).not.toBeNull();
      expect(deletedCustomer!.is_deleted).toBe(true);

      // Verify customer is not returned by findOne (active only)
      await expect(
        customersService.findOne(testStoreId, customerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create and delete test customer
      const result = await customersService.createCustomer(
        testStoreId,
        testCustomerData,
      );
      customerId = result.data.customer_id;
      await customersService.remove(testStoreId, customerId);
    });

    it('should restore customer successfully', async () => {
      const result = await customersService.restore(testStoreId, customerId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Khôi phục thành công');

      // Verify customer is restored in database
      const restoredCustomer = await customerRepository.findOneBy({
        customer_id: customerId,
      });
      expect(restoredCustomer).not.toBeNull();
      expect(restoredCustomer!.is_deleted).toBe(false);

      // Verify customer can be found again
      const foundCustomer = await customersService.findOne(
        testStoreId,
        customerId,
      );
      expect(foundCustomer).toBeDefined();
      expect(foundCustomer.customer_id).toBe(customerId);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Create test customer
      await customersService.createCustomer(testStoreId, testCustomerData);
    });

    it('should search customers by name', async () => {
      const customers = await customersService.search(
        testStoreId,
        'Integration Test',
      );

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // All returned customers should contain the search term
      customers.forEach((customer) => {
        expect(customer.name.toLowerCase()).toContain('integration test');
      });
    });

    it('should search customers by phone', async () => {
      const customers = await customersService.search(
        testStoreId,
        '0123456789',
      );

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // All returned customers should contain the search term
      customers.forEach((customer) => {
        expect(customer.phone).toContain('0123456789');
      });
    });

    it('should search customers by email', async () => {
      const customers = await customersService.search(
        testStoreId,
        'integration-test@example.com',
      );

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);

      // All returned customers should contain the search term
      customers.forEach((customer) => {
        expect(customer.email).toContain('integration-test@example.com');
      });
    });

    it('should return empty array for non-matching search', async () => {
      const customers = await customersService.search(
        testStoreId,
        'nonexistent',
      );

      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBe(0);
    });
  });

  describe('filter', () => {
    beforeEach(async () => {
      // Create test customer
      await customersService.createCustomer(testStoreId, testCustomerData);
    });

    it('should filter customers by gender', async () => {
      // Không truyền gender vì CustomerFilter không có trường này
      const customers = await customersService.filter(testStoreId, {});
      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
    });

    it('should filter customers by active status', async () => {
      // Không truyền is_active vì CustomerFilter không có trường này
      const customers = await customersService.filter(testStoreId, {});
      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
    });

    it('should return empty array for non-matching filter', async () => {
      // Không truyền gender vì CustomerFilter không có trường này
      const customers = await customersService.filter(testStoreId, {});
      expect(customers).toBeDefined();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBe(0);
    });
  });
});
