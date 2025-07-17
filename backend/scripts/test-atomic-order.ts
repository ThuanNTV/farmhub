import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { OrdersService } from '../src/modules/orders/service/orders.service';
import { CreateOrderAtomicDto } from '../src/modules/orders/dto/create-order-atomic.dto';
import { OrderStatus } from '../src/entities/tenant/order.entity';

async function testAtomicOrder() {
  console.log('🚀 Bắt đầu test atomic order creation...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);

  const testStoreId = 'store-001';
  const testUserId = 'user-123';
  const testPaymentMethodId = 'payment-method-001';

  try {
    // Test data
    const orderData: CreateOrderAtomicDto = {
      orderCode: `ORD-ATOMIC-${Date.now()}`,
      customerId: 'customer-123',
      totalAmount: 500,
      discountAmount: 50,
      shippingFee: 20,
      vatPercent: 10,
      vatAmount: 47,
      totalPaid: 517,
      paymentMethodId: testPaymentMethodId,
      paymentDetails: 'Test payment',
      status: OrderStatus.PENDING,
      expectedDeliveryDate: new Date().toISOString(),
      deliveryAddress: '123 Test Street, Test City',
      notes: 'Test atomic order',
      paymentStatus: 'pending',
      isActive: true,
      isDeleted: false,
      orderItems: [
        {
          product_id: 'product-001',
          product_name: 'Test Product 1',
          product_unit_id: 'unit-001',
          quantity: 2,
          unit_price: 200,
        },
        {
          product_id: 'product-002',
          product_name: 'Test Product 2',
          product_unit_id: 'unit-001',
          quantity: 1,
          unit_price: 100,
        },
      ],
    };

    console.log('📝 Test data:', JSON.stringify(orderData, null, 2));

    // Test 1: Normal atomic order creation
    console.log('\n🧪 Test 1: Tạo đơn hàng atomic bình thường');
    try {
      const result = await ordersService.createOrderAtomic(
        testStoreId,
        orderData,
        testUserId,
        testPaymentMethodId,
      );
      console.log('✅ Test 1 thành công:', {
        orderId: result.order_id,
        orderCode: result.order_code,
        totalAmount: result.total_amount,
        totalPaid: result.total_paid,
        itemCount: result.order_items?.length || 0,
      });
    } catch (error) {
      console.error('❌ Test 1 thất bại:', (error as Error).message);
    }

    // Test 2: Test với kho không đủ
    console.log('\n🧪 Test 2: Test với kho không đủ');
    const insufficientStockData = {
      ...orderData,
      orderCode: `ORD-INSUFFICIENT-${Date.now()}`,
      orderItems: [
        {
          product_id: 'product-001',
          product_name: 'Test Product 1',
          product_unit_id: 'unit-001',
          quantity: 999999, // Số lượng rất lớn
          unit_price: 200,
        },
      ],
    };

    try {
      const result = await ordersService.createOrderAtomic(
        testStoreId,
        insufficientStockData,
        testUserId,
        testPaymentMethodId,
      );
      console.log('❌ Test 2 không nên thành công nhưng lại thành công');
    } catch (error) {
      console.log(
        '✅ Test 2 thành công - đúng như mong đợi:',
        (error as Error).message,
      );
    }

    // Test 3: Test với sản phẩm không tồn tại
    console.log('\n🧪 Test 3: Test với sản phẩm không tồn tại');
    const nonExistentProductData = {
      ...orderData,
      orderCode: `ORD-NONEXISTENT-${Date.now()}`,
      orderItems: [
        {
          product_id: 'non-existent-product',
          product_name: 'Non Existent Product',
          product_unit_id: 'unit-001',
          quantity: 1,
          unit_price: 100,
        },
      ],
    };

    try {
      const result = await ordersService.createOrderAtomic(
        testStoreId,
        nonExistentProductData,
        testUserId,
        testPaymentMethodId,
      );
      console.log('❌ Test 3 không nên thành công nhưng lại thành công');
    } catch (error) {
      console.log(
        '✅ Test 3 thành công - đúng như mong đợi:',
        (error as Error).message,
      );
    }

    // Test 4: Test với payment method không hợp lệ
    console.log('\n🧪 Test 4: Test với payment method không hợp lệ');
    try {
      const result = await ordersService.createOrderAtomic(
        testStoreId,
        orderData,
        testUserId,
        'invalid-payment-method',
      );
      console.log('❌ Test 4 không nên thành công nhưng lại thành công');
    } catch (error) {
      console.log(
        '✅ Test 4 thành công - đúng như mong đợi:',
        (error as Error).message,
      );
    }

    // Test 5: Test concurrent orders (simulate race condition)
    console.log('\n🧪 Test 5: Test concurrent orders');
    const concurrentPromises: Promise<any>[] = [];
    for (let i = 0; i < 3; i++) {
      const concurrentData = {
        ...orderData,
        orderCode: `ORD-CONCURRENT-${i}-${Date.now()}`,
        orderItems: [
          {
            product_id: 'product-001',
            product_name: 'Test Product 1',
            product_unit_id: 'unit-001',
            quantity: 1, // Small quantity to avoid stock issues
            unit_price: 100,
          },
        ],
      };

      concurrentPromises.push(
        ordersService
          .createOrderAtomic(
            testStoreId,
            concurrentData,
            testUserId,
            testPaymentMethodId,
          )
          .catch((error: any) => ({ error: error.message })),
      );
    }

    const concurrentResults = await Promise.all(concurrentPromises);
    console.log('📊 Concurrent test results:');
    concurrentResults.forEach((result, index) => {
      if (result && typeof result === 'object' && 'error' in result) {
        console.log(`  Order ${index + 1}: ❌ ${result.error}`);
      } else if (
        result &&
        typeof result === 'object' &&
        'order_code' in result
      ) {
        console.log(`  Order ${index + 1}: ✅ ${result.order_code}`);
      } else {
        console.log(`  Order ${index + 1}: ❓ Unknown result type`);
      }
    });
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await app.close();
    console.log('\n🏁 Test completed');
  }
}

// Run the test
testAtomicOrder().catch(console.error);
