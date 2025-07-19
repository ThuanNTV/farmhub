/**
 * Demo script cho Atomic Transaction
 * Mô phỏng quy trình tạo đơn hàng với atomic transaction
 */

// Mock data
const mockProducts = [
  { id: 'product-001', name: 'Test Product 1', stock: 100, price: 200 },
  { id: 'product-002', name: 'Test Product 2', stock: 50, price: 100 },
];

const mockOrders: any[] = [];
const mockPayments: any[] = [];
const mockAuditLogs: any[] = [];

// Simulate database transaction
class MockTransaction {
  private isCommitted = false;
  private isRolledBack = false;
  private operations: (() => void)[] = [];

  async execute<T>(operation: () => T): Promise<T> {
    if (this.isCommitted || this.isRolledBack) {
      throw new Error('Transaction already completed');
    }

    try {
      const result = operation();
      this.operations.push(() => {
        // Simulate rollback operation
        console.log('  🔄 Rolling back operation...');
      });
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async commit(): Promise<void> {
    if (this.isRolledBack) {
      throw new Error('Cannot commit rolled back transaction');
    }
    this.isCommitted = true;
    console.log('  ✅ Transaction committed');
  }

  async rollback(): Promise<void> {
    if (this.isCommitted) {
      throw new Error('Cannot rollback committed transaction');
    }
    this.isRolledBack = true;
    console.log('  ❌ Transaction rolled back');

    // Execute rollback operations in reverse order
    for (let i = this.operations.length - 1; i >= 0; i--) {
      this.operations[i]();
    }
  }
}

// Mock services
class MockInventoryService {
  async validateStock(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    console.log('  🔍 Validating stock availability...');

    for (const item of items) {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`❌ Sản phẩm ${item.productId} không tồn tại`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `❌ Sản phẩm ${product.name} không đủ kho (cần: ${item.quantity}, có: ${product.stock})`,
        );
      }
      console.log(`    ✅ ${product.name}: ${product.stock} units available`);
    }
  }

  async decreaseStock(
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    console.log('  📦 Decreasing stock...');

    for (const item of items) {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (product) {
        const oldStock = product.stock;
        product.stock -= item.quantity;
        console.log(
          `    - ${product.name}: ${oldStock} → ${product.stock} (-${item.quantity})`,
        );
      }
    }
  }
}

class MockPaymentService {
  async processPayment(
    amount: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.log('  💳 Processing payment...');

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`    ✅ Payment successful: ${transactionId}`);
      return { success: true, transactionId };
    } else {
      console.log('    ❌ Payment failed: Gateway temporarily unavailable');
      return {
        success: false,
        error: 'Payment gateway temporarily unavailable',
      };
    }
  }

  async createPaymentRecord(
    orderId: string,
    amount: number,
    paymentMethodId: string,
    userId: string,
  ): Promise<any> {
    const payment = {
      id: `payment-${Date.now()}`,
      orderId,
      amount,
      paymentMethodId,
      paidByUserId: userId,
      status: 'PAID',
      paidAt: new Date(),
      createdAt: new Date(),
    };

    mockPayments.push(payment);
    console.log(`    📝 Payment record created: ${payment.id}`);
    return payment;
  }
}

class MockAuditService {
  async logOrderCreation(
    userId: string,
    orderId: string,
    orderData: any,
  ): Promise<void> {
    const auditLog = {
      id: `audit-${Date.now()}-1`,
      userId,
      action: 'CREATE_ORDER',
      targetTable: 'orders',
      targetId: orderId,
      metadata: JSON.stringify(orderData),
      createdAt: new Date(),
    };

    mockAuditLogs.push(auditLog);
    console.log(`    📋 Audit log created: Order creation`);
  }

  async logStockUpdate(
    userId: string,
    productId: string,
    stockChange: number,
    reason: string,
  ): Promise<void> {
    const auditLog = {
      id: `audit-${Date.now()}-2`,
      userId,
      action: 'STOCK_UPDATE',
      targetTable: 'products',
      targetId: productId,
      metadata: JSON.stringify({ stockChange, reason }),
      createdAt: new Date(),
    };

    mockAuditLogs.push(auditLog);
    console.log(`    📋 Audit log created: Stock update`);
  }

  async logPayment(
    userId: string,
    paymentId: string,
    paymentData: any,
  ): Promise<void> {
    const auditLog = {
      id: `audit-${Date.now()}-3`,
      userId,
      action: 'CREATE_PAYMENT',
      targetTable: 'payments',
      targetId: paymentId,
      metadata: JSON.stringify(paymentData),
      createdAt: new Date(),
    };

    mockAuditLogs.push(auditLog);
    console.log(`    📋 Audit log created: Payment creation`);
  }
}

// Main atomic order creation function
async function createOrderAtomic(
  orderData: {
    orderCode: string;
    customerId?: string;
    totalAmount: number;
    paymentMethodId: string;
    deliveryAddress: string;
    orderItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
  },
  userId: string,
): Promise<any> {
  console.log(`🚀 Creating order: ${orderData.orderCode}`);

  const transaction = new MockTransaction();
  const inventoryService = new MockInventoryService();
  const paymentService = new MockPaymentService();
  const auditService = new MockAuditService();

  try {
    // Step 1: Validate stock availability (outside transaction for better performance)
    await inventoryService.validateStock(orderData.orderItems);

    // Step 2: Decrease stock
    await transaction.execute(() => {
      inventoryService.decreaseStock(orderData.orderItems);
    });

    // Step 3: Create order
    const order = await transaction.execute(() => {
      const order = {
        id: `order-${Date.now()}`,
        orderCode: orderData.orderCode,
        customerId: orderData.customerId,
        totalAmount: orderData.totalAmount,
        totalPaid: orderData.totalAmount,
        status: 'PENDING',
        deliveryAddress: orderData.deliveryAddress,
        orderItems: orderData.orderItems.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrders.push(order);
      console.log(`  📋 Order created: ${order.orderCode}`);
      return order;
    });

    // Step 4: Process payment
    const paymentResult = await paymentService.processPayment(
      orderData.totalAmount,
      orderData.paymentMethodId,
    );
    if (!paymentResult.success) {
      throw new Error(`❌ Thanh toán thất bại: ${paymentResult.error}`);
    }

    // Step 5: Create payment record
    const payment = await transaction.execute(() => {
      return paymentService.createPaymentRecord(
        order.id,
        orderData.totalAmount,
        orderData.paymentMethodId,
        userId,
      );
    });

    // Step 6: Create audit logs
    await transaction.execute(() => {
      auditService.logOrderCreation(userId, order.id, {
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        itemCount: order.orderItems.length,
      });

      // Log stock updates for each product
      orderData.orderItems.forEach((item) => {
        auditService.logStockUpdate(
          userId,
          item.productId,
          -item.quantity,
          `Order creation: ${order.orderCode}`,
        );
      });

      auditService.logPayment(userId, payment.id, {
        amount: payment.amount,
        paymentMethodId: payment.paymentMethodId,
        orderId: payment.orderId,
      });
    });

    // Commit transaction
    await transaction.commit();

    console.log(
      `✅ Order ${order.orderCode} created successfully with atomic transaction!`,
    );
    return order;
  } catch (error) {
    console.log(`❌ Error creating order: ${(error as Error).message}`);
    throw error;
  }
}

// Test functions
async function testNormalOrder() {
  console.log('\n🧪 Test 1: Tạo đơn hàng atomic bình thường');

  try {
    const orderData = {
      orderCode: `ORD-${Date.now()}`,
      customerId: 'customer-123',
      totalAmount: 500,
      paymentMethodId: 'payment-method-001',
      deliveryAddress: '123 Test Street, Test City',
      orderItems: [
        { productId: 'product-001', quantity: 2, unitPrice: 200 },
        { productId: 'product-002', quantity: 1, unitPrice: 100 },
      ],
    };

    const result = await createOrderAtomic(orderData, 'user-123');
    console.log('✅ Test 1 thành công!');
    return result;
  } catch (error) {
    console.log('❌ Test 1 thất bại:', (error as Error).message);
    throw error;
  }
}

async function testInsufficientStock() {
  console.log('\n🧪 Test 2: Test với kho không đủ');

  try {
    const orderData = {
      orderCode: `ORD-INSUFFICIENT-${Date.now()}`,
      customerId: 'customer-123',
      totalAmount: 999999,
      paymentMethodId: 'payment-method-001',
      deliveryAddress: '123 Test Street, Test City',
      orderItems: [
        { productId: 'product-001', quantity: 999999, unitPrice: 200 }, // Much more than available
      ],
    };

    await createOrderAtomic(orderData, 'user-123');
    console.log('❌ Test 2 không nên thành công nhưng lại thành công');
  } catch (error) {
    console.log(
      '✅ Test 2 thành công - đúng như mong đợi:',
      (error as Error).message,
    );
  }
}

async function testNonExistentProduct() {
  console.log('\n🧪 Test 3: Test với sản phẩm không tồn tại');

  try {
    const orderData = {
      orderCode: `ORD-NONEXISTENT-${Date.now()}`,
      customerId: 'customer-123',
      totalAmount: 100,
      paymentMethodId: 'payment-method-001',
      deliveryAddress: '123 Test Street, Test City',
      orderItems: [
        { productId: 'non-existent-product', quantity: 1, unitPrice: 100 },
      ],
    };

    await createOrderAtomic(orderData, 'user-123');
    console.log('❌ Test 3 không nên thành công nhưng lại thành công');
  } catch (error) {
    console.log(
      '✅ Test 3 thành công - đúng như mong đợi:',
      (error as Error).message,
    );
  }
}

async function testConcurrentOrders() {
  console.log('\n🧪 Test 4: Test concurrent orders');

  const concurrentPromises: Promise<any>[] = [];
  for (let i = 0; i < 3; i++) {
    const orderData = {
      orderCode: `ORD-CONCURRENT-${i}-${Date.now()}`,
      customerId: 'customer-123',
      totalAmount: 100,
      paymentMethodId: 'payment-method-001',
      deliveryAddress: '123 Test Street, Test City',
      orderItems: [
        { productId: 'product-001', quantity: 1, unitPrice: 100 }, // Small quantity
      ],
    };

    concurrentPromises.push(
      createOrderAtomic(orderData, 'user-123').catch((error: any) => ({
        error: error.message,
      })),
    );
  }

  const results = await Promise.all(concurrentPromises);

  console.log('📊 Concurrent test results:');
  results.forEach((result, index) => {
    if (result && typeof result === 'object' && 'error' in result) {
      console.log(`  Order ${index + 1}: ❌ ${result.error}`);
    } else {
      console.log(`  Order ${index + 1}: ✅ Success`);
    }
  });
}

// Main test function
async function runAllTests() {
  console.log('🚀 Bắt đầu demo atomic transaction...');
  console.log('📦 Initial stock levels:');
  mockProducts.forEach((product) => {
    console.log(`  - ${product.name}: ${product.stock} units`);
  });

  try {
    // Test 1: Normal order
    await testNormalOrder();

    // Test 2: Insufficient stock
    await testInsufficientStock();

    // Test 3: Non-existent product
    await testNonExistentProduct();

    // Test 4: Concurrent orders
    await testConcurrentOrders();
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  }

  console.log('\n📊 Final stock levels:');
  mockProducts.forEach((product) => {
    console.log(`  - ${product.name}: ${product.stock} units`);
  });

  console.log('\n📋 Summary:');
  console.log(`  - Orders created: ${mockOrders.length}`);
  console.log(`  - Payments processed: ${mockPayments.length}`);
  console.log(`  - Audit logs created: ${mockAuditLogs.length}`);

  console.log('\n🏁 Demo completed!');
}

// Run the demo
runAllTests().catch(console.error);
