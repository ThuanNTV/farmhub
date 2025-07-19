import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdersService } from '../../../src/modules/orders/service/orders.service';
import { Order, OrderStatus } from '../../../src/entities/tenant/order.entity';
import { OrderItem } from '../../../src/entities/tenant/orderItem.entity';
import { TenantDataSourceService } from '../../../src/config/db/dbtenant/tenant-datasource.service';
import { ProductsService } from '../../../src/modules/products/service/products.service';
import { Product } from '../../../src/entities/tenant/product.entity';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantModule } from '../../../src/config/db/dbtenant/tenant.module';
import { OrdersModule } from '../../../src/modules/orders/orders.module';

describe('OrdersService Integration', () => {
  let app: INestApplication;
  let ordersService: OrdersService;
  let productsService: ProductsService;
  let tenantDataSourceService: TenantDataSourceService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let productRepository: Repository<Product>;

  const testProduct = {
    product_id: '123e4567-e89b-12d3-a456-426614174002',
    product_name: 'Test Product',
    description: 'Test Product Description',
    price: 100.0,
    cost_price: 80.0,
    sku: 'TEST-SKU-001',
    barcode: '1234567890123',
    category_id: '123e4567-e89b-12d3-a456-426614174005',
    unit_id: '123e4567-e89b-12d3-a456-426614174003',
    is_active: true,
    is_deleted: false,
    created_by_user_id: '123e4567-e89b-12d3-a456-426614174001',
    updated_by_user_id: '123e4567-e89b-12d3-a456-426614174001',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const testStoreId = 'test-store-123';
  const testOrderData = {
    orderCode: 'ORD001',
    customerId: '123e4567-e89b-12d3-a456-426614174004',
    discountAmount: 0,
    shippingFee: 0,
    status: OrderStatus.PENDING,
    paymentStatus: 'pending',
    shippingAddress: 'Test Address',
    deliveryAddress: 'Test Address',
    notes: 'Test Notes',
    totalAmount: 200,
    orderItems: [
      {
        product_id: '123e4567-e89b-12d3-a456-426614174002',
        product_name: 'Test Product',
        product_unit_id: '123e4567-e89b-12d3-a456-426614174003',
        quantity: 2,
        unit_price: 100.0,
      },
    ],
  };


  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TenantModule, OrdersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ordersService = moduleFixture.get<OrdersService>(OrdersService);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
    tenantDataSourceService = moduleFixture.get<TenantDataSourceService>(
      TenantDataSourceService,
    );

    // Get repositories for the test store
    const dataSource =
      await tenantDataSourceService.getTenantDataSource(testStoreId);
    orderRepository = dataSource.getRepository(Order);
    orderItemRepository = dataSource.getRepository(OrderItem);
    productRepository = dataSource.getRepository(Product);
  });

  beforeEach(async () => {
    // Clean up database before each test
    await orderItemRepository.delete({ orderId: testOrderData.orderCode });
  afterEach(() => {
    jest.clearAllMocks();
  });

    await orderRepository.delete({ orderCode: testOrderData.orderCode });
    await productRepository.delete({ product_id: testProduct.product_id });

    // Create test product
    await productRepository.save(testProduct);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      // Create new order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result!.orderCode).toBe(testOrderData.orderCode);
      expect(result!.customerId).toBe(testOrderData.customerId);
      expect(result!.totalAmount).toBe(200.0); // 2 * 100.00
      expect(result!.totalPaid).toBe(200.0); // total_amount - discount + shipping
      expect(result!.status).toBe(OrderStatus.PENDING);
      expect(result!.orderItems).toBeDefined();
      expect(result!.orderItems.length).toBe(1);

      // Verify order item
      const orderItem = result!.orderItems[0];
      expect(orderItem.productId).toBe(testOrderData.orderItems[0].product_id);
      expect(orderItem.quantity).toBe(testOrderData.orderItems[0].quantity);
      expect(orderItem.unitPrice).toBe(testOrderData.orderItems[0].unit_price);
      expect(orderItem.totalPrice).toBe(200.0); // 2 * 100.00

      // Verify order exists in database
      const dbOrder = await orderRepository.findOne({
        where: { orderCode: testOrderData.orderCode },
        relations: ['orderItems'],
      });
      expect(dbOrder).not.toBeNull();
      expect(dbOrder!.orderCode).toBe(testOrderData.orderCode);
      expect(dbOrder!.orderItems.length).toBe(1);
    });

    it('should fail to create order with no items', async () => {
      const orderDataWithoutItems = {
        ...testOrderData,
        orderItems: [],
      };

      await expect(
        ordersService.createOrder(testStoreId, orderDataWithoutItems),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail to create order with invalid product ID', async () => {
      const orderDataWithInvalidProduct = {
        ...testOrderData,
        orderItems: [
          {
            product_id: 'invalid-product-id',
            product_name: 'Invalid Product',
            quantity: 2,
            unit_price: 100.0,
          },
        ],
      };

      await expect(
        ordersService.createOrder(testStoreId, orderDataWithInvalidProduct),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail to create order with invalid quantity', async () => {
      const orderDataWithInvalidQuantity = {
        ...testOrderData,
        orderItems: [
          {
            ...testOrderData.orderItems[0],
            quantity: 0,
          },
        ],
      };

      await expect(
        ordersService.createOrder(testStoreId, orderDataWithInvalidQuantity),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail to create order with invalid unit price', async () => {
      const orderDataWithInvalidPrice = {
        ...testOrderData,
        orderItems: [
          {
            ...testOrderData.orderItems[0],
            unit_price: 0,
          },
        ],
      };

      await expect(
        ordersService.createOrder(testStoreId, orderDataWithInvalidPrice),
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate total amount correctly with multiple items', async () => {
      const orderDataWithMultipleItems = {
        ...testOrderData,
        orderCode: 'ORD002',
        orderItems: [
          {
            product_id: '123e4567-e89b-12d3-a456-426614174002',
            product_name: 'Product 1',
            quantity: 2,
            unit_price: 100.0,
          },
          {
            product_id: '123e4567-e89b-12d3-a456-426614174003',
            product_name: 'Product 2',
            quantity: 1,
            unit_price: 50.0,
          },
        ],
      };

      const result = await ordersService.createOrder(
        testStoreId,
        orderDataWithMultipleItems,
      );

      expect(result!.totalAmount).toBe(250.0); // 2 * 100 + 1 * 50
      expect(result!.orderItems.length).toBe(2);
    });

    it('should calculate total paid with discount and shipping', async () => {
      const orderDataWithDiscountAndShipping = {
        ...testOrderData,
        orderCode: 'ORD003',
        discountAmount: 20.0,
        shippingFee: 10.0,
      };

      const result = await ordersService.createOrder(
        testStoreId,
        orderDataWithDiscountAndShipping,
      );

      expect(result!.totalAmount).toBe(200.0); // 2 * 100
      expect(result!.totalPaid).toBe(190.0); // 200 - 20 + 10
      // expect(result!.discountAmount).toBe(20.0);
      // expect(result!.shippingFee).toBe(10.0);
    });
  });

  describe('findAllOrder', () => {
    beforeEach(async () => {
      // Create test order
      await ordersService.createOrder(testStoreId, testOrderData);
    });

    it('should return all active orders', async () => {
      const orders = await ordersService.findAllOrder(testStoreId);

      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);

      // Check if our test order is in the list
      const testOrder = orders.find(
        (o) => o.orderCode === testOrderData.orderCode,
      );
      expect(testOrder).toBeDefined();
      expect(testOrder!.orderCode).toBe(testOrderData.orderCode);
      expect(testOrder!.orderItems).toBeDefined();
    });
  });

  describe('findOne', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should return order by ID', async () => {
      const order = await ordersService.findOne(testStoreId, orderId);

      expect(order).toBeDefined();
      expect(order.orderId).toBe(orderId);
      expect(order.orderCode).toBe(testOrderData.orderCode);
      expect(order.orderItems).toBeDefined();
      expect(order.orderItems.length).toBe(1);
    });

    it('should throw NotFoundException for non-existent order', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        ordersService.findOne(testStoreId, nonExistentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should update order successfully', async () => {
      const updateData = {
        orderCode: testOrderData.orderCode,
        status: OrderStatus.CONFIRMED,
        notes: 'Updated Notes',
      };

      const result = await ordersService.update(
        testStoreId,
        orderId,
        updateData,
      );

      expect(result!).toBeDefined();
      expect(result!.status).toBe(OrderStatus.CONFIRMED);
      expect(result!.note).toBe('Updated Notes');

      // Verify in database
      const updatedOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(updatedOrder).not.toBeNull();
      expect(updatedOrder!.status).toBe(OrderStatus.CONFIRMED);
      expect(updatedOrder!.note).toBe('Updated Notes');
    });

    it('should throw error if order not found', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateData = {
        orderCode: testOrderData.orderCode,
        status: OrderStatus.CONFIRMED,
      };

      await expect(
        ordersService.update(testStoreId, nonExistentId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if order is not in pending status', async () => {
      // First confirm the order
      await ordersService.confirmOrder(testStoreId, orderId);

      // Try to update confirmed order
      const updateData = {
        orderCode: testOrderData.orderCode,
        status: OrderStatus.SHIPPED,
      };

      await expect(
        ordersService.update(testStoreId, orderId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should soft delete order successfully', async () => {
      const result = await ordersService.remove(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toContain('đã được xóa');
      expect(result!.data).toBeNull();

      // Verify order is soft deleted in database
      const deletedOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(deletedOrder).not.toBeNull();
      expect(deletedOrder!.isDeleted).toBe(true);

      // Verify order is not returned by findOne (active only)
      await expect(ordersService.findOne(testStoreId, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create and delete test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
      await ordersService.remove(testStoreId, orderId);
    });

    it('should restore order successfully', async () => {
      const result = await ordersService.restore(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toBe('Khôi phục đơn hàng thành công');
      expect(result!.data).toBeDefined();

      // Verify order is restored in database
      const restoredOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(restoredOrder).not.toBeNull();
      expect(restoredOrder!.isDeleted).toBe(false);

      // Verify order can be found again
      const foundOrder = await ordersService.findOne(testStoreId, orderId);
      expect(foundOrder).toBeDefined();
      expect(foundOrder.orderId).toBe(orderId);
    });

    it('should throw error if order not found or not deleted', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      await expect(
        ordersService.restore(testStoreId, nonExistentId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('confirmOrder', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should confirm order successfully', async () => {
      const result = await ordersService.confirmOrder(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toBe('Đơn hàng đã được xác nhận');
      expect(result!.data).toBeDefined();

      // Verify order status in database
      const confirmedOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(confirmedOrder).not.toBeNull();
      expect(confirmedOrder!.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw error if order is not in pending status', async () => {
      // First confirm the order
      await ordersService.confirmOrder(testStoreId, orderId);

      // Try to confirm again
      await expect(
        ordersService.confirmOrder(testStoreId, orderId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('shipOrder', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create and confirm test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
      await ordersService.confirmOrder(testStoreId, orderId);
    });

    it('should ship order successfully', async () => {
      const result = await ordersService.shipOrder(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toBe('Đơn hàng đã được giao');
      expect(result!.data).toBeDefined();

      // Verify order status in database
      const shippedOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(shippedOrder).not.toBeNull();
      expect(shippedOrder!.status).toBe(OrderStatus.SHIPPED);
    });

    it('should throw error if order is not in confirmed status', async () => {
      // Try to ship without confirming first
      const newOrder = await ordersService.createOrder(testStoreId, {
        ...testOrderData,
        orderCode: 'ORD004',
      });
      expect(newOrder).toBeDefined();
      await expect(
        ordersService.shipOrder(testStoreId, newOrder!.orderId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('completeOrder', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create, confirm, and ship test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
      await ordersService.confirmOrder(testStoreId, orderId);
      await ordersService.shipOrder(testStoreId, orderId);
    });

    it('should complete order successfully', async () => {
      const result = await ordersService.completeOrder(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toBe('Đơn hàng đã hoàn thành');
      expect(result!.data).toBeDefined();

      // Verify order status in database
      const completedOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(completedOrder).not.toBeNull();
      expect(completedOrder!.status).toBe(OrderStatus.DELIVERED);
    });

    it('should throw error if order is not in shipped status', async () => {
      // Try to complete without shipping first
      const newOrder = await ordersService.createOrder(testStoreId, {
        ...testOrderData,
        orderCode: 'ORD005',
      });
      expect(newOrder).toBeDefined();
      await ordersService.confirmOrder(testStoreId, newOrder!.orderId);

      await expect(
        ordersService.completeOrder(testStoreId, newOrder!.orderId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('cancelOrder', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should cancel order successfully', async () => {
      const result = await ordersService.cancelOrder(testStoreId, orderId);

      expect(result!).toBeDefined();
      expect(result!.message).toBe('Đơn hàng đã được hủy');
      expect(result!.data).toBeDefined();

      // Verify order status in database
      const cancelledOrder = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(cancelledOrder).not.toBeNull();
      expect(cancelledOrder!.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error if order is already completed', async () => {
      // Complete the order first
      await ordersService.confirmOrder(testStoreId, orderId);
      await ordersService.shipOrder(testStoreId, orderId);
      await ordersService.completeOrder(testStoreId, orderId);

      // Try to cancel completed order
      await expect(
        ordersService.cancelOrder(testStoreId, orderId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByStatus', () => {
    beforeEach(async () => {
      // Create test orders with different statuses
      await ordersService.createOrder(testStoreId, testOrderData);

      const confirmedOrder = await ordersService.createOrder(testStoreId, {
        ...testOrderData,
        orderCode: 'ORD006',
      });
      expect(confirmedOrder).toBeDefined();
      await ordersService.confirmOrder(testStoreId, confirmedOrder!.orderId);
    });

    it('should return orders by status', async () => {
      const pendingOrders = await ordersService.findByStatus(
        testStoreId,
        OrderStatus.PENDING,
      );
      const confirmedOrders = await ordersService.findByStatus(
        testStoreId,
        OrderStatus.CONFIRMED,
      );

      expect(pendingOrders).toBeDefined();
      expect(Array.isArray(pendingOrders)).toBe(true);
      expect(pendingOrders.length).toBeGreaterThan(0);

      expect(confirmedOrders).toBeDefined();
      expect(Array.isArray(confirmedOrders)).toBe(true);
      expect(confirmedOrders.length).toBeGreaterThan(0);

      // All returned orders should have the correct status
      pendingOrders.forEach((order) => {
        expect(order.status).toBe(OrderStatus.PENDING);
      });

      confirmedOrders.forEach((order) => {
        expect(order.status).toBe(OrderStatus.CONFIRMED);
      });
    });

    it('should return empty array for status with no orders', async () => {
      const cancelledOrders = await ordersService.findByStatus(
        testStoreId,
        OrderStatus.CANCELLED,
      );

      expect(cancelledOrders).toBeDefined();
      expect(Array.isArray(cancelledOrders)).toBe(true);
      expect(cancelledOrders.length).toBe(0);
    });
  });

  describe('findByCustomer', () => {
    beforeEach(async () => {
      // Create test orders for the same customer
      await ordersService.createOrder(testStoreId, testOrderData);
      await ordersService.createOrder(testStoreId, {
        ...testOrderData,
        orderCode: 'ORD007',
      });
    });

    it('should return orders by customer ID', async () => {
      const customerOrders = await ordersService.findByCustomer(
        testStoreId,
        testOrderData.customerId,
      );

      expect(customerOrders).toBeDefined();
      expect(Array.isArray(customerOrders)).toBe(true);
      expect(customerOrders.length).toBeGreaterThan(0);

      // All returned orders should belong to the customer
      customerOrders.forEach((order) => {
        expect(order.customerId).toBe(testOrderData.customerId);
      });
    });

    it('should return empty array for customer with no orders', async () => {
      const customerOrders = await ordersService.findByCustomer(
        testStoreId,
        '123e4567-e89b-12d3-a456-426614174999',
      );

      expect(customerOrders).toBeDefined();
      expect(Array.isArray(customerOrders)).toBe(true);
      expect(customerOrders.length).toBe(0);
    });
  });

  describe('order status transitions', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create test order
      const result = await ordersService.createOrder(
        testStoreId,
        testOrderData,
      );
      orderId = result!.orderId;
    });

    it('should follow correct status transition: PENDING -> CONFIRMED -> SHIPPED -> COMPLETED', async () => {
      // PENDING -> CONFIRMED
      await ordersService.confirmOrder(testStoreId, orderId);
      let order = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(order!.status).toBe(OrderStatus.CONFIRMED);

      // CONFIRMED -> SHIPPED
      await ordersService.shipOrder(testStoreId, orderId);
      order = await orderRepository.findOne({ where: { orderId: orderId } });
      expect(order!.status).toBe(OrderStatus.SHIPPED);

      // SHIPPED -> COMPLETED
      await ordersService.completeOrder(testStoreId, orderId);
      order = await orderRepository.findOne({ where: { orderId: orderId } });
      expect(order!.status).toBe(OrderStatus.DELIVERED);
    });

    it('should allow cancellation from PENDING status', async () => {
      await ordersService.cancelOrder(testStoreId, orderId);
      const order = await orderRepository.findOne({
        where: { orderId: orderId },
      });
      expect(order!.status).toBe(OrderStatus.CANCELLED);
    });

    it('should prevent invalid status transitions', async () => {
      // Try to ship without confirming
      await expect(
        ordersService.shipOrder(testStoreId, orderId),
      ).rejects.toThrow(InternalServerErrorException);

      // Try to complete without shipping
      await expect(
        ordersService.completeOrder(testStoreId, orderId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('order calculations', () => {
    it('should calculate totals correctly with complex scenarios', async () => {
      const complexOrderData = {
        ...testOrderData,
        orderCode: 'ORD008',
        discountAmount: 50.0,
        shippingFee: 25.0,
        orderItems: [
          {
            product_id: '123e4567-e89b-12d3-a456-426614174002',
            product_name: 'Product 1',
            quantity: 3,
            unit_price: 100.0,
          },
          {
            product_id: '123e4567-e89b-12d3-a456-426614174003',
            product_name: 'Product 2',
            quantity: 2,
            unit_price: 75.0,
          },
        ],
      };

      const result = await ordersService.createOrder(
        testStoreId,
        complexOrderData,
      );

      expect(result!.totalAmount).toBe(450.0); // 3 * 100 + 2 * 75
      expect(result!.totalPaid).toBe(425.0); // 450 - 50 + 25
      expect(result!.orderItems.length).toBe(2);
    });
  });
});
