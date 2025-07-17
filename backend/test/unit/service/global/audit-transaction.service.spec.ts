import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { AuditTransactionService } from 'src/service/global/audit-transaction.service';
import { AuditLog } from 'src/entities/tenant/audit_log.entity';

describe('AuditTransactionService', () => {
  let service: AuditTransactionService;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockAuditRepository: any;

  beforeEach(async () => {
    mockAuditRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockEntityManager = {
      getRepository: jest.fn().mockReturnValue(mockAuditRepository),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditTransactionService],
    }).compile();

    service = module.get<AuditTransactionService>(AuditTransactionService);
  });

  describe('createAuditLog', () => {
    it('should create audit log successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'CREATE',
        target_table: 'orders',
        target_id: 'order-1',
        metadata: { test: 'data' },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.createAuditLog(
        'user-1',
        'CREATE',
        'orders',
        'order-1',
        { test: 'data' },
        mockEntityManager,
      );

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(AuditLog);
      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'CREATE',
        target_table: 'orders',
        target_id: 'order-1',
        metadata: { test: 'data' },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(mockAuditRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.createAuditLog(
          'user-1',
          'CREATE',
          'orders',
          'order-1',
          { test: 'data' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Database error');
    });

    it('should handle different types of errors', async () => {
      const error = new TypeError('Type error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.createAuditLog(
          'user-1',
          'CREATE',
          'orders',
          'order-1',
          { test: 'data' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Type error');
    });

    it('should handle repository creation error', async () => {
      const error = new Error('Repository error');
      mockEntityManager.getRepository.mockImplementation(() => {
        throw error;
      });

      await expect(
        service.createAuditLog(
          'user-1',
          'CREATE',
          'orders',
          'order-1',
          { test: 'data' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Repository error');
    });

    it('should handle non-Error exceptions in createAuditLog', async () => {
      const error = 'String error';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.createAuditLog(
          'user-1',
          'CREATE',
          'orders',
          'order-1',
          { test: 'data' },
          mockEntityManager,
        ),
      ).rejects.toBe('String error');
    });

    it('should handle null/undefined errors in createAuditLog', async () => {
      const error = null;
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.createAuditLog(
          'user-1',
          'CREATE',
          'orders',
          'order-1',
          { test: 'data' },
          mockEntityManager,
        ),
      ).rejects.toBeNull();
    });
  });

  describe('logOrderCreation', () => {
    it('should log order creation successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'CREATE_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          orderData: { amount: 100 },
          timestamp: expect.any(String),
          operation: 'order_creation',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logOrderCreation(
        'user-1',
        'order-1',
        { amount: 100 },
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'CREATE_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          orderData: { amount: 100 },
          timestamp: expect.any(String),
          operation: 'order_creation',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in order creation logging', async () => {
      const error = new Error('Logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCreation(
          'user-1',
          'order-1',
          { amount: 100 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Logging error');
    });

    it('should handle different error types in order creation', async () => {
      const error = new RangeError('Range error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCreation(
          'user-1',
          'order-1',
          { amount: 100 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Range error');
    });

    it('should handle non-Error exceptions in order creation', async () => {
      const error = 'String error in order creation';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCreation(
          'user-1',
          'order-1',
          { amount: 100 },
          mockEntityManager,
        ),
      ).rejects.toBe('String error in order creation');
    });
  });

  describe('logOrderUpdate', () => {
    it('should log order update successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'UPDATE_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          oldData: { amount: 100 },
          newData: { amount: 150 },
          timestamp: expect.any(String),
          operation: 'order_update',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logOrderUpdate(
        'user-1',
        'order-1',
        { amount: 100 },
        { amount: 150 },
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'UPDATE_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          oldData: { amount: 100 },
          newData: { amount: 150 },
          timestamp: expect.any(String),
          operation: 'order_update',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in order update logging', async () => {
      const error = new Error('Update logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderUpdate(
          'user-1',
          'order-1',
          { amount: 100 },
          { amount: 150 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Update logging error');
    });

    it('should handle different error types in order update', async () => {
      const error = new ReferenceError('Reference error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderUpdate(
          'user-1',
          'order-1',
          { amount: 100 },
          { amount: 150 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Reference error');
    });

    it('should handle non-Error exceptions in order update', async () => {
      const error = 'String error in order update';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderUpdate(
          'user-1',
          'order-1',
          { amount: 100 },
          { amount: 150 },
          mockEntityManager,
        ),
      ).rejects.toBe('String error in order update');
    });
  });

  describe('logOrderCancellation', () => {
    it('should log order cancellation successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'CANCEL_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          reason: 'Customer request',
          timestamp: expect.any(String),
          operation: 'order_cancellation',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logOrderCancellation(
        'user-1',
        'order-1',
        'Customer request',
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'CANCEL_ORDER',
        target_table: 'order',
        target_id: 'order-1',
        metadata: {
          reason: 'Customer request',
          timestamp: expect.any(String),
          operation: 'order_cancellation',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in order cancellation logging', async () => {
      const error = new Error('Cancellation logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCancellation(
          'user-1',
          'order-1',
          'Customer request',
          mockEntityManager,
        ),
      ).rejects.toThrow('Cancellation logging error');
    });

    it('should handle different error types in order cancellation', async () => {
      const error = new EvalError('Eval error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCancellation(
          'user-1',
          'order-1',
          'Customer request',
          mockEntityManager,
        ),
      ).rejects.toThrow('Eval error');
    });

    it('should handle non-Error exceptions in order cancellation', async () => {
      const error = 'String error in order cancellation';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logOrderCancellation(
          'user-1',
          'order-1',
          'Customer request',
          mockEntityManager,
        ),
      ).rejects.toBe('String error in order cancellation');
    });
  });

  describe('logStockUpdate', () => {
    it('should log stock update successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'UPDATE_STOCK',
        target_table: 'product',
        target_id: 'product-1',
        metadata: {
          stockChange: 10,
          reason: 'Manual adjustment',
          timestamp: expect.any(String),
          operation: 'stock_update',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logStockUpdate(
        'user-1',
        'product-1',
        10,
        'Manual adjustment',
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'UPDATE_STOCK',
        target_table: 'product',
        target_id: 'product-1',
        metadata: {
          stockChange: 10,
          reason: 'Manual adjustment',
          timestamp: expect.any(String),
          operation: 'stock_update',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in stock update logging', async () => {
      const error = new Error('Stock logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logStockUpdate(
          'user-1',
          'product-1',
          10,
          'Manual adjustment',
          mockEntityManager,
        ),
      ).rejects.toThrow('Stock logging error');
    });

    it('should handle different error types in stock update', async () => {
      const error = new URIError('URI error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logStockUpdate(
          'user-1',
          'product-1',
          10,
          'Manual adjustment',
          mockEntityManager,
        ),
      ).rejects.toThrow('URI error');
    });

    it('should handle non-Error exceptions in stock update', async () => {
      const error = 'String error in stock update';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logStockUpdate(
          'user-1',
          'product-1',
          10,
          'Manual adjustment',
          mockEntityManager,
        ),
      ).rejects.toBe('String error in stock update');
    });
  });

  describe('logPayment', () => {
    it('should log payment successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'CREATE_PAYMENT',
        target_table: 'payment',
        target_id: 'payment-1',
        metadata: {
          paymentData: { amount: 100, method: 'card' },
          timestamp: expect.any(String),
          operation: 'payment_creation',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logPayment(
        'user-1',
        'payment-1',
        { amount: 100, method: 'card' },
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'CREATE_PAYMENT',
        target_table: 'payment',
        target_id: 'payment-1',
        metadata: {
          paymentData: { amount: 100, method: 'card' },
          timestamp: expect.any(String),
          operation: 'payment_creation',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in payment logging', async () => {
      const error = new Error('Payment logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logPayment(
          'user-1',
          'payment-1',
          { amount: 100, method: 'card' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Payment logging error');
    });

    it('should handle different error types in payment logging', async () => {
      const error = new Error('Custom payment error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logPayment(
          'user-1',
          'payment-1',
          { amount: 100, method: 'card' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Custom payment error');
    });

    it('should handle non-Error exceptions in payment logging', async () => {
      const error = 'String error in payment logging';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logPayment(
          'user-1',
          'payment-1',
          { amount: 100, method: 'card' },
          mockEntityManager,
        ),
      ).rejects.toBe('String error in payment logging');
    });
  });

  describe('logProductCreation', () => {
    it('should log product creation successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'CREATE_PRODUCT',
        target_table: 'product',
        target_id: 'product-1',
        metadata: {
          productData: { name: 'Test Product', price: 100 },
          timestamp: expect.any(String),
          operation: 'product_creation',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logProductCreation(
        'user-1',
        'product-1',
        { name: 'Test Product', price: 100 },
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        action: 'CREATE_PRODUCT',
        target_table: 'product',
        target_id: 'product-1',
        metadata: {
          productData: { name: 'Test Product', price: 100 },
          timestamp: expect.any(String),
          operation: 'product_creation',
        },
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        is_deleted: false,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in product creation logging', async () => {
      const error = new Error('Product logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logProductCreation(
          'user-1',
          'product-1',
          { name: 'Test Product', price: 100 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Product logging error');
    });

    it('should handle different error types in product creation', async () => {
      const error = new Error('Custom product error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logProductCreation(
          'user-1',
          'product-1',
          { name: 'Test Product', price: 100 },
          mockEntityManager,
        ),
      ).rejects.toThrow('Custom product error');
    });

    it('should handle non-Error exceptions in product creation', async () => {
      const error = 'String error in product creation';
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logProductCreation(
          'user-1',
          'product-1',
          { name: 'Test Product', price: 100 },
          mockEntityManager,
        ),
      ).rejects.toBe('String error in product creation');
    });
  });

  describe('logCustomerAction', () => {
    it('should log customer action successfully', async () => {
      const mockAuditLog = {
        id: 'audit-1',
        user_id: 'user-1',
        action: 'UPDATE_CUSTOMER',
        target_table: 'customer',
        target_id: 'customer-1',
        metadata: {
          action: 'UPDATE_CUSTOMER',
          actionData: { name: 'Updated Name' },
          timestamp: expect.any(String),
          operation: 'customer_action',
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
      };

      mockAuditRepository.create.mockReturnValue(mockAuditLog);
      mockAuditRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.logCustomerAction(
        'user-1',
        'customer-1',
        'UPDATE_CUSTOMER',
        { name: 'Updated Name' },
        mockEntityManager,
      );

      expect(mockAuditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          action: 'UPDATE_CUSTOMER',
          target_table: 'customer',
          target_id: 'customer-1',
          metadata: expect.objectContaining({
            actionData: { name: 'Updated Name' },
            operation: 'customer_action',
          }),
          is_deleted: false,
        }),
      );
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle error in customer action logging', async () => {
      const error = new Error('Customer action logging error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logCustomerAction(
          'user-1',
          'customer-1',
          'UPDATE_CUSTOMER',
          { name: 'Updated Name' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Customer action logging error');
    });

    it('should handle different error types in customer action', async () => {
      const error = new Error('Custom customer error');
      mockAuditRepository.save.mockRejectedValue(error);

      await expect(
        service.logCustomerAction(
          'user-1',
          'customer-1',
          'UPDATE_CUSTOMER',
          { name: 'Updated Name' },
          mockEntityManager,
        ),
      ).rejects.toThrow('Custom customer error');
    });
  });
});
