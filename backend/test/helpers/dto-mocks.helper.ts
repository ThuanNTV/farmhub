import { TestDataGenerator } from './mock-factory.helper';

/**
 * Helper to create mock DTOs for testing
 */
export class DtoMockHelper {
  /**
   * Creates a valid CreateProductDto
   */
  static createValidCreateProductDto(overrides: any = {}) {
    return {
      productId: TestDataGenerator.generateUUID(),
      productCode: `SP${TestDataGenerator.generateRandomNumber(1000, 9999)}`,
      name: `Test Product ${TestDataGenerator.generateRandomString(5)}`,
      slug: `test-product-${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test product description',
      categoryId: TestDataGenerator.generateUUID(),
      brand: 'Test Brand',
      unitId: TestDataGenerator.generateUUID(),
      priceRetail: TestDataGenerator.generatePrice(),
      priceWholesale: TestDataGenerator.generatePrice(),
      creditPrice: TestDataGenerator.generatePrice(),
      costPrice: TestDataGenerator.generatePrice(),
      barcode: TestDataGenerator.generateRandomNumber(
        100000000000,
        999999999999,
      ).toString(),
      stock: TestDataGenerator.generateStockQuantity(),
      minStockLevel: TestDataGenerator.generateRandomNumber(1, 50),
      images: 'image1.jpg,image2.jpg',
      specs: 'Test specifications',
      warrantyInfo: '12 months',
      supplierId: TestDataGenerator.generateUUID(),
      isActive: true,
      isDeleted: false,
      ...overrides,
    };
  }

  /**
   * Creates a valid UpdateProductDto
   */
  static createValidUpdateProductDto(overrides: any = {}) {
    return {
      name: `Updated Product ${TestDataGenerator.generateRandomString(5)}`,
      priceRetail: TestDataGenerator.generatePrice(),
      stock: TestDataGenerator.generateStockQuantity(),
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Creates a valid CreatePaymentDto
   */
  static createValidCreatePaymentDto(overrides: any = {}) {
    return {
      orderId: TestDataGenerator.generateUUID(),
      paymentMethodId: TestDataGenerator.generateUUID(),
      amount: TestDataGenerator.generatePrice().toString(),
      status: 'pending',
      note: 'Test payment note',
      paidByUserId: TestDataGenerator.generateUUID(),
      ...overrides,
    };
  }

  /**
   * Creates a valid UpdatePaymentDto
   */
  static createValidUpdatePaymentDto(overrides: any = {}) {
    return {
      status: 'completed',
      note: 'Updated payment note',
      amount: TestDataGenerator.generatePrice().toString(),
      ...overrides,
    };
  }

  /**
   * Creates a valid CreateOrderDto
   */
  static createValidCreateOrderDto(overrides: any = {}) {
    return {
      customerId: TestDataGenerator.generateUUID(),
      orderItems: [
        {
          productId: TestDataGenerator.generateUUID(),
          quantity: TestDataGenerator.generateRandomNumber(1, 10),
          unitPrice: TestDataGenerator.generatePrice(),
        },
      ],
      totalAmount: TestDataGenerator.generatePrice(),
      status: 'pending',
      orderDate: TestDataGenerator.generateDate(),
      ...overrides,
    };
  }

  /**
   * Creates a valid CreateCustomerDto
   */
  static createValidCreateCustomerDto(overrides: any = {}) {
    return {
      customerCode: `CUS${TestDataGenerator.generateRandomNumber(1000, 9999)}`,
      name: `Customer ${TestDataGenerator.generateRandomString(5)}`,
      email: TestDataGenerator.generateEmail(),
      phone: TestDataGenerator.generatePhoneNumber(),
      address: 'Test Customer Address',
      ...overrides,
    };
  }

  /**
   * Creates a valid CreateCategoryDto
   */
  static createValidCreateCategoryDto(overrides: any = {}) {
    return {
      name: `Category ${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test category description',
      parentId: null,
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Creates a valid CreateUnitDto
   */
  static createValidCreateUnitDto(overrides: any = {}) {
    return {
      name: `Unit ${TestDataGenerator.generateRandomString(3)}`,
      symbol: TestDataGenerator.generateRandomString(2).toUpperCase(),
      description: 'Test unit description',
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Creates a valid CreatePaymentMethodDto
   */
  static createValidCreatePaymentMethodDto(overrides: any = {}) {
    return {
      name: `Payment Method ${TestDataGenerator.generateRandomString(5)}`,
      description: 'Test payment method description',
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Creates a valid CreateSupplierDto
   */
  static createValidCreateSupplierDto(overrides: any = {}) {
    return {
      name: `Supplier ${TestDataGenerator.generateRandomString(5)}`,
      contactPerson: `Contact ${TestDataGenerator.generateRandomString(5)}`,
      email: TestDataGenerator.generateEmail(),
      phone: TestDataGenerator.generatePhoneNumber(),
      address: 'Test Supplier Address',
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Creates invalid DTOs for validation testing
   */
  static createInvalidDtos() {
    return {
      createProduct: [
        {
          dto: { productCode: '', name: 'Test' }, // Empty product code
          expectedError: 'Mã sản phẩm không được để trống',
        },
        {
          dto: { productCode: 'SP001', name: '' }, // Empty name
          expectedError: 'Tên sản phẩm không được để trống',
        },
        {
          dto: { productCode: 'SP001', name: 'Test', priceRetail: -100 }, // Negative price
          expectedError: 'Giá bán phải lớn hơn 0',
        },
        {
          dto: { productCode: 'SP001', name: 'Test', stock: -10 }, // Negative stock
          expectedError: 'Tồn kho không được nhỏ hơn 0',
        },
        {
          dto: { productCode: 'SP001', name: 'A'.repeat(300) }, // Name too long
          expectedError: 'Tên sản phẩm tối đa 255 ký tự',
        },
      ],
      createPayment: [
        {
          dto: { orderId: '', amount: '100' }, // Empty order ID
          expectedError: 'Order ID không được để trống',
        },
        {
          dto: { orderId: TestDataGenerator.generateUUID(), amount: '' }, // Empty amount
          expectedError: 'Số tiền không được để trống',
        },
        {
          dto: { orderId: TestDataGenerator.generateUUID(), amount: '-100' }, // Negative amount
          expectedError: 'Số tiền phải lớn hơn 0',
        },
      ],
      createCustomer: [
        {
          dto: { name: '', email: 'test@example.com' }, // Empty name
          expectedError: 'Tên khách hàng không được để trống',
        },
        {
          dto: { name: 'Test Customer', email: 'invalid-email' }, // Invalid email
          expectedError: 'Email không hợp lệ',
        },
        {
          dto: { name: 'Test Customer', phone: '123' }, // Invalid phone
          expectedError: 'Số điện thoại không hợp lệ',
        },
      ],
      createCategory: [
        {
          dto: { name: '' }, // Empty name
          expectedError: 'Tên danh mục không được để trống',
        },
        {
          dto: { name: 'A'.repeat(300) }, // Name too long
          expectedError: 'Tên danh mục tối đa 255 ký tự',
        },
      ],
      createUnit: [
        {
          dto: { name: '', symbol: 'KG' }, // Empty name
          expectedError: 'Tên đơn vị không được để trống',
        },
        {
          dto: { name: 'Kilogram', symbol: '' }, // Empty symbol
          expectedError: 'Ký hiệu đơn vị không được để trống',
        },
      ],
      createPaymentMethod: [
        {
          dto: { name: '' }, // Empty name
          expectedError: 'Tên phương thức thanh toán không được để trống',
        },
      ],
      createSupplier: [
        {
          dto: { name: '', email: 'test@example.com' }, // Empty name
          expectedError: 'Tên nhà cung cấp không được để trống',
        },
        {
          dto: { name: 'Test Supplier', email: 'invalid-email' }, // Invalid email
          expectedError: 'Email không hợp lệ',
        },
      ],
    };
  }

  /**
   * Creates query DTOs for filtering and pagination
   */
  static createQueryDtos() {
    return {
      pagination: {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      },
      productFilter: {
        categoryId: TestDataGenerator.generateUUID(),
        isActive: true,
        minPrice: 10,
        maxPrice: 1000,
        search: 'test product',
      },
      paymentFilter: {
        status: 'completed',
        startDate: TestDataGenerator.generateDate(-30).toISOString(),
        endDate: TestDataGenerator.generateDate().toISOString(),
        paymentMethodId: TestDataGenerator.generateUUID(),
      },
      orderFilter: {
        status: 'pending',
        customerId: TestDataGenerator.generateUUID(),
        startDate: TestDataGenerator.generateDate(-30).toISOString(),
        endDate: TestDataGenerator.generateDate().toISOString(),
      },
    };
  }

  /**
   * Creates response DTOs for testing
   */
  static createResponseDtos() {
    return {
      success: {
        success: true,
        message: 'Operation completed successfully',
        data: {},
        timestamp: new Date().toISOString(),
      },
      error: {
        success: false,
        message: 'Operation failed',
        error: 'Detailed error message',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      },
      paginated: {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      },
    };
  }
}
