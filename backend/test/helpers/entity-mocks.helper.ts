import { TestDataGenerator } from './mock-factory.helper';

/**
 * Helper to create mock entities with proper structure and relationships
 */
export class EntityMockHelper {
  /**
   * Creates a mock Product entity with all required fields and methods
   */
  static createMockProduct(overrides: any = {}) {
    const baseProduct = {
      productId: TestDataGenerator.generateUUID(),
      product_id: TestDataGenerator.generateUUID(),
      product_code: `SP${TestDataGenerator.generateRandomNumber(1000, 9999)}`,
      name: `Test Product ${TestDataGenerator.generateRandomString(5)}`,
      slug: `test-product-${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test product description',
      category_id: TestDataGenerator.generateUUID(),
      brand: 'Test Brand',
      unit_id: TestDataGenerator.generateUUID(),
      price_retail: TestDataGenerator.generatePrice(),
      price_wholesale: TestDataGenerator.generatePrice(),
      credit_price: TestDataGenerator.generatePrice(),
      cost_price: TestDataGenerator.generatePrice(),
      barcode: TestDataGenerator.generateRandomNumber(
        100000000000,
        999999999999,
      ).toString(),
      stock: TestDataGenerator.generateStockQuantity(),
      min_stock_level: TestDataGenerator.generateRandomNumber(1, 50),
      images: 'image1.jpg,image2.jpg',
      specs: 'Test specifications',
      warranty_info: '12 months',
      supplier_id: TestDataGenerator.generateUUID(),
      is_active: true,
      is_deleted: false,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      created_by_user_id: TestDataGenerator.generateUUID(),
      updated_by_user_id: TestDataGenerator.generateUUID(),
      // Mock entity methods
      getUnit: jest.fn().mockResolvedValue(null),
      getCreatedByUser: jest.fn().mockResolvedValue(null),
      getUpdatedByUser: jest.fn().mockResolvedValue(null),
      category: null,
      ...overrides,
    };

    return baseProduct;
  }

  /**
   * Creates a mock Payment entity
   */
  static createMockPayment(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      order_id: TestDataGenerator.generateUUID(),
      payment_method_id: TestDataGenerator.generateUUID(),
      amount: TestDataGenerator.generatePrice().toString(),
      status: 'completed',
      note: 'Test payment note',
      paid_by_user_id: TestDataGenerator.generateUUID(),
      paid_at: TestDataGenerator.generateDate(-1),
      created_at: TestDataGenerator.generateDate(-2),
      updated_at: TestDataGenerator.generateDate(-1),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock Order entity
   */
  static createMockOrder(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      order_code: `ORD${TestDataGenerator.generateRandomNumber(10000, 99999)}`,
      customer_id: TestDataGenerator.generateUUID(),
      total_amount: TestDataGenerator.generatePrice(),
      status: 'pending',
      order_date: TestDataGenerator.generateDate(-1),
      created_at: TestDataGenerator.generateDate(-2),
      updated_at: TestDataGenerator.generateDate(-1),
      created_by_user_id: TestDataGenerator.generateUUID(),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock Customer entity
   */
  static createMockCustomer(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      customer_code: `CUS${TestDataGenerator.generateRandomNumber(1000, 9999)}`,
      name: `Customer ${TestDataGenerator.generateRandomString(5)}`,
      email: TestDataGenerator.generateEmail(),
      phone: TestDataGenerator.generatePhoneNumber(),
      address: 'Test Address',
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock User entity
   */
  static createMockUser(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      email: TestDataGenerator.generateEmail(),
      username: `user_${TestDataGenerator.generateRandomString(5)}`,
      full_name: `Test User ${TestDataGenerator.generateRandomString(5)}`,
      phone: TestDataGenerator.generatePhoneNumber(),
      is_active: true,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      ...overrides,
    };
  }

  /**
   * Creates a mock Category entity
   */
  static createMockCategory(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      name: `Category ${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test category description',
      parent_id: null,
      is_active: true,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock Unit entity
   */
  static createMockUnit(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      name: `Unit ${TestDataGenerator.generateRandomString(3)}`,
      symbol: TestDataGenerator.generateRandomString(2).toUpperCase(),
      description: 'Test unit description',
      is_active: true,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      ...overrides,
    };
  }

  /**
   * Creates a mock PaymentMethod entity
   */
  static createMockPaymentMethod(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      name: `Payment Method ${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test payment method',
      is_active: true,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock Supplier entity
   */
  static createMockSupplier(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      name: `Supplier ${TestDataGenerator.generateRandomString(5)}`,
      contact_person: `Contact ${TestDataGenerator.generateRandomString(5)}`,
      email: TestDataGenerator.generateEmail(),
      phone: TestDataGenerator.generatePhoneNumber(),
      address: 'Test Supplier Address',
      is_active: true,
      created_at: TestDataGenerator.generateDate(-30),
      updated_at: TestDataGenerator.generateDate(-1),
      is_deleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a mock OrderItem entity
   */
  static createMockOrderItem(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      order_id: TestDataGenerator.generateUUID(),
      product_id: TestDataGenerator.generateUUID(),
      quantity: TestDataGenerator.generateRandomNumber(1, 10),
      unit_price: TestDataGenerator.generatePrice(),
      total_price: TestDataGenerator.generatePrice(),
      created_at: TestDataGenerator.generateDate(-1),
      updated_at: TestDataGenerator.generateDate(-1),
      ...overrides,
    };
  }

  /**
   * Creates a mock AuditLog entity
   */
  static createMockAuditLog(overrides: any = {}) {
    return {
      id: TestDataGenerator.generateUUID(),
      action: 'CREATE',
      entity_type: 'Product',
      entity_id: TestDataGenerator.generateUUID(),
      user_id: TestDataGenerator.generateUUID(),
      changes: '{"name": "old_value"}',
      ip_address: '192.168.1.1',
      user_agent: 'Test User Agent',
      created_at: TestDataGenerator.generateDate(-1),
      ...overrides,
    };
  }
}

/**
 * Helper to create collections of mock entities
 */
export class EntityCollectionHelper {
  static createMockProductList(count = 5, overrides: any = {}) {
    return Array.from({ length: count }, (_, index) =>
      EntityMockHelper.createMockProduct({
        product_code: `SP${1000 + index}`,
        name: `Product ${index + 1}`,
        ...overrides,
      }),
    );
  }

  static createMockPaymentList(count = 5, overrides: any = {}) {
    return Array.from({ length: count }, (_, index) =>
      EntityMockHelper.createMockPayment({
        amount: (100 + index * 50).toString(),
        ...overrides,
      }),
    );
  }

  static createMockOrderList(count = 5, overrides: any = {}) {
    return Array.from({ length: count }, (_, index) =>
      EntityMockHelper.createMockOrder({
        order_code: `ORD${10000 + index}`,
        total_amount: 100 + index * 50,
        ...overrides,
      }),
    );
  }

  static createMockCustomerList(count = 5, overrides: any = {}) {
    return Array.from({ length: count }, (_, index) =>
      EntityMockHelper.createMockCustomer({
        customer_code: `CUS${1000 + index}`,
        name: `Customer ${index + 1}`,
        email: `customer${index + 1}@example.com`,
        ...overrides,
      }),
    );
  }
}
