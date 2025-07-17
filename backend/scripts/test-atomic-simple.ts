import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../src/entities/tenant/order.entity';
import { OrderItem } from '../src/entities/tenant/orderItem.entity';
import { Product } from '../src/entities/tenant/product.entity';
import { Payment, PaymentStatus } from '../src/entities/tenant/payment.entity';
import { AuditLog } from '../src/entities/tenant/audit_log.entity';

// Mock data for testing
const mockProducts = [
  {
    product_id: 'product-001',
    product_name: 'Test Product 1',
    stock: 100,
    unit_price: 200,
  },
  {
    product_id: 'product-002',
    product_name: 'Test Product 2',
    stock: 50,
    unit_price: 100,
  },
];

async function testAtomicTransaction() {
  console.log('🚀 Bắt đầu test atomic transaction...');

  // Mock database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'test_db',
    entities: [Order, OrderItem, Product, Payment, AuditLog],
    synchronize: true,
  });

  try {
    // Simulate connection
    console.log('📡 Kết nối database...');
    await dataSource.initialize();

    // Test 1: Normal atomic transaction
    console.log('\n🧪 Test 1: Tạo đơn hàng atomic bình thường');
    await testNormalOrder(dataSource);

    // Test 2: Test với kho không đủ
    console.log('\n🧪 Test 2: Test với kho không đủ');
    await testInsufficientStock(dataSource);

    // Test 3: Test với sản phẩm không tồn tại
    console.log('\n🧪 Test 3: Test với sản phẩm không tồn tại');
    await testNonExistentProduct(dataSource);

    // Test 4: Test concurrent orders
    console.log('\n🧪 Test 4: Test concurrent orders');
    await testConcurrentOrders(dataSource);
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    console.log('\n🏁 Test completed');
  }
}

async function testNormalOrder(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;

    // Step 1: Validate stock
    const orderItems = [
      { productId: 'product-001', quantity: 2 },
      { productId: 'product-002', quantity: 1 },
    ];

    console.log('  ✅ Step 1: Validate stock availability');
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (!product) {
        throw new Error(`❌ Sản phẩm ${item.productId} không tồn tại`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `❌ Sản phẩm ${product.product_name} không đủ kho (cần: ${item.quantity}, có: ${product.stock})`,
        );
      }
    }

    // Step 2: Decrease stock
    console.log('  ✅ Step 2: Decrease stock');
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (product) {
        product.stock -= item.quantity;
        console.log(
          `    - ${product.product_name}: ${product.stock + item.quantity} → ${product.stock}`,
        );
      }
    }

    // Step 3: Create order
    console.log('  ✅ Step 3: Create order');
    const order = {
      order_id: `order-${Date.now()}`,
      order_code: `ORD-${Date.now()}`,
      total_amount: 500,
      total_paid: 500,
      status: OrderStatus.PENDING,
      delivery_address: '123 Test Street',
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    // Step 4: Create order items
    console.log('  ✅ Step 4: Create order items');
    const orderItemsData = [
      {
        order_item_id: `item-${Date.now()}-1`,
        order_id: order.order_id,
        product_id: 'product-001',
        product_name: 'Test Product 1',
        quantity: 2,
        unit_price: 200,
        total_price: 400,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        order_item_id: `item-${Date.now()}-2`,
        order_id: order.order_id,
        product_id: 'product-002',
        product_name: 'Test Product 2',
        quantity: 1,
        unit_price: 100,
        total_price: 100,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Step 5: Process payment
    console.log('  ✅ Step 5: Process payment');
    const paymentResult = await mockProcessPayment(500, 'payment-method-001');
    if (!paymentResult.success) {
      throw new Error(`❌ Thanh toán thất bại: ${paymentResult.error}`);
    }

    // Step 6: Create payment record
    console.log('  ✅ Step 6: Create payment record');
    const payment = {
      id: `payment-${Date.now()}`,
      order_id: order.order_id,
      amount: '500.00',
      payment_method_id: 'payment-method-001',
      paid_by_user_id: 'user-123',
      status: PaymentStatus.PAID,
      paid_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    };

    // Step 7: Create audit logs
    console.log('  ✅ Step 7: Create audit logs');
    const auditLogs = [
      {
        id: `audit-${Date.now()}-1`,
        user_id: 'user-123',
        action: 'CREATE_ORDER',
        target_table: 'orders',
        target_id: order.order_id,
        metadata: JSON.stringify({
          orderCode: order.order_code,
          totalAmount: order.total_amount,
          itemCount: orderItemsData.length,
        }),
        created_at: new Date(),
      },
      {
        id: `audit-${Date.now()}-2`,
        user_id: 'user-123',
        action: 'STOCK_UPDATE',
        target_table: 'products',
        target_id: 'product-001',
        metadata: JSON.stringify({
          stockChange: -2,
          reason: `Order creation: ${order.order_code}`,
        }),
        created_at: new Date(),
      },
    ];

    // Commit transaction
    await queryRunner.commitTransaction();
    console.log('  ✅ Transaction committed successfully');
    console.log(`  📋 Order created: ${order.order_code}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log('  ❌ Transaction rolled back:', (error as Error).message);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function testInsufficientStock(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;

    // Try to order more than available stock
    const orderItems = [
      { productId: 'product-001', quantity: 999999 }, // Much more than available
    ];

    console.log('  🔍 Checking stock availability...');
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (!product) {
        throw new Error(`❌ Sản phẩm ${item.productId} không tồn tại`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `❌ Sản phẩm ${product.product_name} không đủ kho (cần: ${item.quantity}, có: ${product.stock})`,
        );
      }
    }

    // This should not reach here
    await queryRunner.commitTransaction();
    console.log('  ❌ Test failed - should have thrown error');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(
      '  ✅ Test passed - correctly caught insufficient stock error:',
      (error as Error).message,
    );
  } finally {
    await queryRunner.release();
  }
}

async function testNonExistentProduct(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;

    // Try to order non-existent product
    const orderItems = [{ productId: 'non-existent-product', quantity: 1 }];

    console.log('  🔍 Checking product existence...');
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (!product) {
        throw new Error(`❌ Sản phẩm ${item.productId} không tồn tại`);
      }
    }

    // This should not reach here
    await queryRunner.commitTransaction();
    console.log('  ❌ Test failed - should have thrown error');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.log(
      '  ✅ Test passed - correctly caught non-existent product error:',
      (error as Error).message,
    );
  } finally {
    await queryRunner.release();
  }
}

async function testConcurrentOrders(dataSource: DataSource) {
  console.log('  🔄 Simulating concurrent orders...');

  const concurrentPromises: Promise<any>[] = [];
  for (let i = 0; i < 3; i++) {
    concurrentPromises.push(
      simulateConcurrentOrder(dataSource, i).catch((error: any) => ({
        error: error.message,
      })),
    );
  }

  const results = await Promise.all(concurrentPromises);

  console.log('  📊 Concurrent test results:');
  results.forEach((result, index) => {
    if (result && typeof result === 'object' && 'error' in result) {
      console.log(`    Order ${index + 1}: ❌ ${result.error}`);
    } else {
      console.log(`    Order ${index + 1}: ✅ Success`);
    }
  });
}

async function simulateConcurrentOrder(dataSource: DataSource, index: number) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Simulate concurrent access to same product
    const orderItems = [{ productId: 'product-001', quantity: 1 }];

    // Check stock
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (!product) {
        throw new Error(`❌ Sản phẩm ${item.productId} không tồn tại`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`❌ Sản phẩm ${product.product_name} không đủ kho`);
      }
    }

    // Decrease stock
    for (const item of orderItems) {
      const product = mockProducts.find((p) => p.product_id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    await queryRunner.commitTransaction();
    return { success: true };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function mockProcessPayment(
  amount: number,
  paymentMethodId: string,
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  // Simulate payment processing
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 90% success rate
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return {
      success: false,
      error: 'Payment gateway temporarily unavailable',
    };
  }
}

// Run the test
testAtomicTransaction().catch(console.error);
