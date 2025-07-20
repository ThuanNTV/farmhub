import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/dto/update-product.dto';

describe('Product DTO Validation', () => {
  describe('CreateProductDto', () => {
    let validDto: CreateProductDto;

    beforeEach(() => {
      validDto = {
        productId: 'test-id-123',
        productCode: 'PROD001',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        categoryId: 'cat-123',
        brand: 'Test Brand',
        unitId: 'unit-123',
        priceRetail: 100.5,
        priceWholesale: 80.0,
        creditPrice: 120.0,
        costPrice: 60.0,
        barcode: '123456789012',
        stock: 50,
        minStockLevel: 10,
        images: '{"url": "test.jpg"}',
        specs: '{"size": "M"}',
        warrantyInfo: '1 year',
        supplierId: 'sup-123',
        isActive: true,
        isDeleted: false,
        createdByUserId: 'user-123',
        updatedByUserId: 'user-123',
      };
    });

    describe('Price Validation', () => {
      it('should pass with valid positive prices', async () => {
        const dto = plainToClass(CreateProductDto, validDto);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('should fail when priceRetail is zero', async () => {
        validDto.priceRetail = 0;
        const dto = plainToClass(CreateProductDto, validDto);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find((err) => err.property === 'priceRetail');
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá bán lẻ phải lớn hơn 0',
        );
      });

      it('should fail when priceRetail is negative', async () => {
        validDto.priceRetail = -10;
        const dto = plainToClass(CreateProductDto, validDto);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find((err) => err.property === 'priceRetail');
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá bán lẻ phải lớn hơn 0',
        );
      });

      it('should fail when priceWholesale is zero', async () => {
        validDto.priceWholesale = 0;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find(
          (err) => err.property === 'priceWholesale',
        );
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá bán sỉ phải lớn hơn 0',
        );
      });

      it('should fail when priceWholesale is negative', async () => {
        validDto.priceWholesale = -5;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find(
          (err) => err.property === 'priceWholesale',
        );
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá bán sỉ phải lớn hơn 0',
        );
      });

      it('should fail when creditPrice is zero', async () => {
        validDto.creditPrice = 0;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find((err) => err.property === 'creditPrice');
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá trả góp phải lớn hơn 0',
        );
      });

      it('should fail when costPrice is negative', async () => {
        validDto.costPrice = -1;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const priceError = errors.find((err) => err.property === 'costPrice');
        expect(priceError?.constraints?.isPositive).toBe(
          'Giá vốn phải lớn hơn 0',
        );
      });

      it('should pass when optional prices are undefined', async () => {
        delete validDto.priceWholesale;
        delete validDto.creditPrice;
        delete validDto.costPrice;

        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('Barcode Validation', () => {
      it('should pass with valid 12-digit barcode', async () => {
        validDto.barcode = '123456789012';
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });

      it('should pass with valid 13-digit barcode', async () => {
        validDto.barcode = '1234567890123';
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });

      it('should fail with 11-digit barcode', async () => {
        validDto.barcode = '12345678901';
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const barcodeError = errors.find((err) => err.property === 'barcode');
        expect(barcodeError?.constraints?.matches).toBe(
          'Barcode phải đúng định dạng 12 hoặc 13 chữ số',
        );
      });

      it('should fail with 14-digit barcode', async () => {
        validDto.barcode = '12345678901234';
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const barcodeError = errors.find((err) => err.property === 'barcode');
        expect(barcodeError?.constraints?.matches).toBe(
          'Barcode phải đúng định dạng 12 hoặc 13 chữ số',
        );
      });

      it('should fail with alphabetic characters in barcode', async () => {
        validDto.barcode = '12345678901a';
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const barcodeError = errors.find((err) => err.property === 'barcode');
        expect(barcodeError?.constraints?.matches).toBe(
          'Barcode phải đúng định dạng 12 hoặc 13 chữ số',
        );
      });

      it('should fail with special characters in barcode', async () => {
        validDto.barcode = '123456789-12';
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const barcodeError = errors.find((err) => err.property === 'barcode');
        expect(barcodeError?.constraints?.matches).toBe(
          'Barcode phải đúng định dạng 12 hoặc 13 chữ số',
        );
      });

      it('should pass when barcode is undefined (optional field)', async () => {
        delete validDto.barcode;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });
    });

    describe('CategoryId Validation', () => {
      it('should fail when categoryId is empty', async () => {
        validDto.categoryId = '';
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const categoryError = errors.find(
          (err) => err.property === 'categoryId',
        );
        expect(categoryError?.constraints?.isNotEmpty).toBe(
          'Danh mục (categoryId) không được để trống',
        );
      });

      it('should fail when categoryId is not string', async () => {
        (validDto as any).categoryId = 123;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const categoryError = errors.find(
          (err) => err.property === 'categoryId',
        );
        expect(categoryError?.constraints?.isString).toBeDefined();
      });
    });

    describe('Required Fields Validation', () => {
      it('should fail when required fields are missing', async () => {
        const incompleteDto = {} as CreateProductDto;
        const errors = await validate(incompleteDto);

        expect(errors.length).toBeGreaterThan(0);

        // Check some required fields
        expect(errors.some((err) => err.property === 'productId')).toBe(true);
        expect(errors.some((err) => err.property === 'productCode')).toBe(true);
        expect(errors.some((err) => err.property === 'name')).toBe(true);
        expect(errors.some((err) => err.property === 'priceRetail')).toBe(true);
      });
    });

    describe('Stock Validation', () => {
      it('should pass with valid stock values', async () => {
        validDto.stock = 100;
        validDto.minStockLevel = 10;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });

      it('should fail when stock is negative', async () => {
        validDto.stock = -1;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const stockError = errors.find((err) => err.property === 'stock');
        expect(stockError?.constraints?.min).toBe(
          'Tồn kho không được nhỏ hơn 0',
        );
      });

      it('should fail when minStockLevel is negative', async () => {
        validDto.minStockLevel = -1;
        const errors = await validate(validDto);

        expect(errors.length).toBeGreaterThan(0);
        const stockError = errors.find(
          (err) => err.property === 'minStockLevel',
        );
        expect(stockError?.constraints?.min).toBe(
          'Ngưỡng tồn kho không được nhỏ hơn 0',
        );
      });

      it('should pass with zero stock values', async () => {
        validDto.stock = 0;
        validDto.minStockLevel = 0;
        const errors = await validate(validDto);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('UpdateProductDto', () => {
    it('should pass with partial valid data', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product Name',
        priceRetail: 150.0,
      };

      const errors = await validate(updateDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail with invalid price in update', async () => {
      const updateDto: UpdateProductDto = {
        priceRetail: -10,
      };

      const errors = await validate(updateDto);
      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((err) => err.property === 'priceRetail');
      expect(priceError?.constraints?.isPositive).toBe(
        'Giá bán lẻ phải lớn hơn 0',
      );
    });

    it('should fail with invalid barcode in update', async () => {
      const updateDto: UpdateProductDto = {
        barcode: 'invalid-barcode',
      };

      const errors = await validate(updateDto);
      expect(errors.length).toBeGreaterThan(0);
      const barcodeError = errors.find((err) => err.property === 'barcode');
      expect(barcodeError?.constraints?.matches).toBe(
        'Barcode phải đúng định dạng 12 hoặc 13 chữ số',
      );
    });
  });
});
