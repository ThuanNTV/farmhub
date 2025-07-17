import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentsService } from '../../../src/modules/payments/service/payments.service';
import { Payment } from '../../../src/entities/tenant/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TenantDatabaseModule } from '../../../src/config/db/dbtenant/tenant-database.module';
import { PaymentsModule } from '../../../src/modules/payments.module';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('PaymentsService Integration', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;
  let tenantDataSourceService: TenantDataSourceService;
  let paymentRepository: Repository<Payment>;

  const testStoreId = 'test-store-123';
  const testPaymentData = {
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    paymentMethodId: '123e4567-e89b-12d3-a456-426614174002',
    amount: 200.0,
    currency: 'VND',
    status: 'completed',
    transactionId: 'TXN123456',
    paidByUserId: '123e4567-e89b-12d3-a456-426614174003',
    notes: 'Integration Test Payment',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantDatabaseModule, PaymentsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    // Get repository for the test store
    const dataSource =
      await tenantDataSourceService.getTenantDataSource(testStoreId);
    paymentRepository = dataSource.getRepository(Payment);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await paymentRepository.delete({
      transaction_id: testPaymentData.transactionId,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('create', () => {
    it('should create a new payment successfully', async () => {
      // Create new payment
      const result = await paymentsService.create(testStoreId, testPaymentData);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.order_id).toBe(testPaymentData.orderId);
      expect(result.payment_method_id).toBe(testPaymentData.paymentMethodId);
      expect(result.amount).toBe(testPaymentData.amount);
      expect(result.currency).toBe(testPaymentData.currency);
      expect(result.status).toBe(testPaymentData.status);
      expect(result.transaction_id).toBe(testPaymentData.transactionId);
      expect(result.paid_by_user_id).toBe(testPaymentData.paidByUserId);
      expect(result.notes).toBe(testPaymentData.notes);

      // Verify payment exists in database
      const dbPayment = await paymentRepository.findOneBy({
        transaction_id: testPaymentData.transactionId,
      });
      expect(dbPayment).not.toBeNull();
      expect(dbPayment!.amount).toBe(testPaymentData.amount);
      expect(dbPayment!.status).toBe(testPaymentData.status);
      expect(dbPayment!.is_deleted).toBe(false);
    });

    it('should fail to create payment with invalid amount', async () => {
      const invalidPaymentData = {
        ...testPaymentData,
        amount: 0,
      };

      await expect(
        paymentsService.create(testStoreId, invalidPaymentData),
      ).rejects.toThrow();
    });

    it('should fail to create payment with invalid currency', async () => {
      const invalidPaymentData = {
        ...testPaymentData,
        currency: 'INVALID',
      };

      await expect(
        paymentsService.create(testStoreId, invalidPaymentData),
      ).rejects.toThrow();
    });

    it('should fail to create payment with invalid status', async () => {
      const invalidPaymentData = {
        ...testPaymentData,
        status: 'invalid-status',
      };

      await expect(
        paymentsService.create(testStoreId, invalidPaymentData),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test payment
      await paymentsService.create(testStoreId, testPaymentData);
    });

    it('should return all payments with relations', async () => {
      const payments = await paymentsService.findAll(testStoreId);

      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBeGreaterThan(0);

      // Check if our test payment is in the list
      const testPayment = payments.find(
        (p) => p.transaction_id === testPaymentData.transactionId,
      );
      expect(testPayment).toBeDefined();
      expect(testPayment!.amount).toBe(testPaymentData.amount);
      expect(testPayment!.status).toBe(testPaymentData.status);
    });
  });

  describe('findOne', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
    });

    it('should return payment by ID', async () => {
      const payment = await paymentsService.findOne(testStoreId, paymentId);

      expect(payment).toBeDefined();
      expect(payment.id).toBe(paymentId);
      expect(payment.transaction_id).toBe(testPaymentData.transactionId);
      expect(payment.amount).toBe(testPaymentData.amount);
      expect(payment.status).toBe(testPaymentData.status);
    });

    it('should throw NotFoundException for non-existent payment', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        paymentsService.findOne(testStoreId, nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
    });

    it('should return payment by ID', async () => {
      const payment = await paymentsService.findById(testStoreId, paymentId);

      expect(payment).toBeDefined();
      expect(payment!.id).toBe(paymentId);
      expect(payment!.transaction_id).toBe(testPaymentData.transactionId);
    });

    it('should return null for non-existent payment', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      const payment = await paymentsService.findById(
        testStoreId,
        nonExistentId,
      );

      expect(payment).toBeNull();
    });
  });

  describe('update', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
    });

    it('should update payment successfully', async () => {
      const updateData = {
        amount: 250.0,
        status: 'pending',
        notes: 'Updated Integration Test Payment',
      };

      const result = await paymentsService.update(
        testStoreId,
        paymentId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(updateData.amount);
      expect(result.status).toBe(updateData.status);
      expect(result.notes).toBe(updateData.notes);

      // Verify in database
      const updatedPayment = await paymentRepository.findOneBy({
        id: paymentId,
      });
      expect(updatedPayment).not.toBeNull();
      expect(updatedPayment!.amount).toBe(updateData.amount);
      expect(updatedPayment!.status).toBe(updateData.status);
      expect(updatedPayment!.notes).toBe(updateData.notes);
    });

    it('should throw error if payment not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateData = {
        amount: 250.0,
      };

      await expect(
        paymentsService.update(testStoreId, nonExistentId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should fail to update with invalid amount', async () => {
      const updateData = {
        amount: -100,
      };

      await expect(
        paymentsService.update(testStoreId, paymentId, updateData),
      ).rejects.toThrow();
    });

    it('should fail to update with invalid status', async () => {
      const updateData = {
        status: 'invalid-status',
      };

      await expect(
        paymentsService.update(testStoreId, paymentId, updateData),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
    });

    it('should soft delete payment successfully', async () => {
      const result = await paymentsService.remove(testStoreId, paymentId);

      expect(result).toBeDefined();
      expect(result.message).toContain('đã được xóa mềm');
      expect(result.data).toBeNull();

      // Verify payment is soft deleted in database
      const deletedPayment = await paymentRepository.findOneBy({
        id: paymentId,
      });
      expect(deletedPayment).not.toBeNull();
      expect(deletedPayment!.is_deleted).toBe(true);

      // Verify payment is not returned by findOne (active only)
      await expect(
        paymentsService.findOne(testStoreId, paymentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if payment not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        paymentsService.remove(testStoreId, nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create and delete test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
      await paymentsService.remove(testStoreId, paymentId);
    });

    it('should restore payment successfully', async () => {
      const result = await paymentsService.restore(testStoreId, paymentId);

      expect(result).toBeDefined();
      expect(result.message).toBe('Khôi phục payment thành công');
      expect(result.data).toBeDefined();

      // Verify payment is restored in database
      const restoredPayment = await paymentRepository.findOneBy({
        id: paymentId,
      });
      expect(restoredPayment).not.toBeNull();
      expect(restoredPayment!.is_deleted).toBe(false);

      // Verify payment can be found again
      const foundPayment = await paymentsService.findOne(
        testStoreId,
        paymentId,
      );
      expect(foundPayment).toBeDefined();
      expect(foundPayment.id).toBe(paymentId);
    });

    it('should throw error if payment not found or not deleted', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        paymentsService.restore(testStoreId, nonExistentId),
      ).rejects.toThrow();
    });
  });

  describe('findWithFilters', () => {
    beforeEach(async () => {
      // Create test payments with different statuses
      await paymentsService.create(testStoreId, testPaymentData);

      await paymentsService.create(testStoreId, {
        ...testPaymentData,
        transactionId: 'TXN123457',
        status: 'pending',
        amount: 150.0,
      });

      await paymentsService.create(testStoreId, {
        ...testPaymentData,
        transactionId: 'TXN123458',
        status: 'failed',
        amount: 300.0,
      });
    });

    it('should return filtered payments by status', async () => {
      const filters = {
        status: 'completed',
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);

      // All returned payments should have the correct status
      result.data.forEach((payment) => {
        expect(payment.status).toBe('completed');
      });

      // Check pagination
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should return filtered payments by amount range', async () => {
      const filters = {
        min_amount: 100,
        max_amount: 200,
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();

      // All returned payments should be within the amount range
      result.data.forEach((payment) => {
        expect(payment.amount).toBeGreaterThanOrEqual(100);
        expect(payment.amount).toBeLessThanOrEqual(200);
      });
    });

    it('should return filtered payments by date range', async () => {
      const filters = {
        start_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return filtered payments by multiple criteria', async () => {
      const filters = {
        status: 'completed',
        min_amount: 100,
        max_amount: 500,
        page: 1,
        limit: 5,
        sort_by: 'amount',
        sort_order: 'DESC' as const,
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();

      // Check if payments are sorted by amount in descending order
      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].amount).toBeGreaterThanOrEqual(
          result.data[i + 1].amount,
        );
      }
    });

    it('should handle pagination correctly', async () => {
      const filters = {
        page: 1,
        limit: 2,
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.hasNext).toBeDefined();
      expect(result.pagination.hasPrev).toBeDefined();
    });

    it('should return empty results for non-existent filters', async () => {
      const filters = {
        status: 'non-existent-status',
      };

      const result = await paymentsService.findWithFilters(
        testStoreId,
        filters,
      );

      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getPaymentStats', () => {
    beforeEach(async () => {
      // Create test payments with different statuses and amounts
      await paymentsService.create(testStoreId, testPaymentData);

      await paymentsService.create(testStoreId, {
        ...testPaymentData,
        transactionId: 'TXN123457',
        status: 'pending',
        amount: 150.0,
      });

      await paymentsService.create(testStoreId, {
        ...testPaymentData,
        transactionId: 'TXN123458',
        status: 'completed',
        amount: 300.0,
      });
    });

    it('should return payment statistics', async () => {
      const filters = {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      const stats = await paymentsService.getPaymentStats(testStoreId, filters);

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBeGreaterThan(0);
    });

    it('should return statistics by payment method', async () => {
      const filters = {
        payment_method_id: testPaymentData.paymentMethodId,
      };

      const stats = await paymentsService.getPaymentStats(testStoreId, filters);

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
    });

    it('should handle empty statistics', async () => {
      const filters = {
        start_date: new Date('2020-01-01'),
        end_date: new Date('2020-01-31'),
      };

      const stats = await paymentsService.getPaymentStats(testStoreId, filters);

      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('payment status transitions', () => {
    let paymentId: string;

    beforeEach(async () => {
      // Create test payment
      const result = await paymentsService.create(testStoreId, testPaymentData);
      paymentId = result.id;
    });

    it('should allow valid status updates', async () => {
      // Update to pending
      await paymentsService.update(testStoreId, paymentId, {
        status: 'pending',
      });
      let payment = await paymentsService.findOne(testStoreId, paymentId);
      expect(payment.status).toBe('pending');

      // Update to completed
      await paymentsService.update(testStoreId, paymentId, {
        status: 'completed',
      });
      payment = await paymentsService.findOne(testStoreId, paymentId);
      expect(payment.status).toBe('completed');

      // Update to failed
      await paymentsService.update(testStoreId, paymentId, {
        status: 'failed',
      });
      payment = await paymentsService.findOne(testStoreId, paymentId);
      expect(payment.status).toBe('failed');
    });
  });

  describe('payment amount calculations', () => {
    it('should handle different currencies correctly', async () => {
      const usdPaymentData = {
        ...testPaymentData,
        transactionId: 'TXN123459',
        currency: 'USD',
        amount: 50.0,
      };

      const result = await paymentsService.create(testStoreId, usdPaymentData);

      expect(result).toBeDefined();
      expect(result.currency).toBe('USD');
      expect(result.amount).toBe(50.0);
    });

    it('should handle large amounts correctly', async () => {
      const largeAmountPaymentData = {
        ...testPaymentData,
        transactionId: 'TXN123460',
        amount: 999999.99,
      };

      const result = await paymentsService.create(
        testStoreId,
        largeAmountPaymentData,
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(999999.99);
    });

    it('should handle decimal amounts correctly', async () => {
      const decimalAmountPaymentData = {
        ...testPaymentData,
        transactionId: 'TXN123461',
        amount: 123.45,
      };

      const result = await paymentsService.create(
        testStoreId,
        decimalAmountPaymentData,
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(123.45);
    });
  });

  describe('transaction ID uniqueness', () => {
    it('should enforce unique transaction IDs', async () => {
      // Create first payment
      await paymentsService.create(testStoreId, testPaymentData);

      // Try to create second payment with same transaction ID
      const duplicatePaymentData = {
        ...testPaymentData,
        orderId: '123e4567-e89b-12d3-a456-426614174002',
      };

      await expect(
        paymentsService.create(testStoreId, duplicatePaymentData),
      ).rejects.toThrow();
    });

    it('should allow same transaction ID after original payment is deleted', async () => {
      // Create first payment
      const firstPayment = await paymentsService.create(
        testStoreId,
        testPaymentData,
      );

      // Delete first payment
      await paymentsService.remove(testStoreId, firstPayment.id);

      // Create second payment with same transaction ID
      const secondPaymentData = {
        ...testPaymentData,
        orderId: '123e4567-e89b-12d3-a456-426614174002',
      };

      const secondPayment = await paymentsService.create(
        testStoreId,
        secondPaymentData,
      );

      expect(secondPayment).toBeDefined();
      expect(secondPayment.transaction_id).toBe(testPaymentData.transactionId);
    });
  });
});
