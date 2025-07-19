import { PrintingService } from 'src/modules/printing/service/printing.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PrintingService', () => {
  let service: PrintingService;
  let tenantDS: any;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    tenantDS = {
      getTenantDataSource: jest.fn().mockResolvedValue({
        getRepository: jest.fn().mockReturnValue(mockRepo),
      }),
    };
    service = new PrintingService(tenantDS);
    jest.spyOn(service as any, 'generatePDF').mockResolvedValue('pdf-url');
    jest.spyOn(service as any, 'generateBarcode').mockResolvedValue('barcode-url');
  });

  // printInvoice
  it('printInvoice throw nếu thiếu orderId', async () => {
    await expect(service.printInvoice('store1', '')).rejects.toThrow(BadRequestException);
  });

  it('printInvoice trả về đúng dữ liệu khi đủ thông tin', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({ order_id: 'order1', customer_id: 'cus1', total_amount: 100, created_at: new Date(), customer: { name: 'A', email: 'a@mail.com' }, payment_method: {} }) // order
      .mockResolvedValueOnce({ name: 'A', email: 'a@mail.com' }); // customer
    mockRepo.find.mockResolvedValue([{ order_item_id: 'item1', product_name: 'P', quantity: 2, unit_price: 10, total_price: 20, product: {} }]);
    const result = await service.printInvoice('store1', 'order1');
    expect(result.status).toBe('success');
    expect(result.pdfUrl).toBe('pdf-url');
    expect(result.data.data.customerName).toBe('A');
  });

  it('printInvoice trả về customerName Unknown nếu không có customer', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({ order_id: 'order1', customer_id: 'cus1', total_amount: 100, created_at: new Date(), customer: null, payment_method: {} }) // order
      .mockResolvedValueOnce(null); // customer
    mockRepo.find.mockResolvedValue([{ order_item_id: 'item1', product_name: 'P', quantity: 2, unit_price: 10, total_price: 20, product: {} }]);
    const result = await service.printInvoice('store1', 'order1');
    expect(result.data.data.customerName).toBe('Unknown');
  });

  // printReceipt
  it('printReceipt throw nếu thiếu paymentId', async () => {
    await expect(service.printReceipt('store1', '')).rejects.toThrow(BadRequestException);
  });

  it('printReceipt throw nếu không có payment', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // payment
    await expect(service.printReceipt('store1', 'pay1')).rejects.toThrow(NotFoundException);
  });

  it('printReceipt trả về đúng dữ liệu khi đủ thông tin', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({ id: 'pay1', order_id: 'order1', amount: 100, created_at: new Date(), order: { customer: 'A' }, payment_method: {}, paid_by_user: {} }) // payment
      .mockResolvedValueOnce({ customer: 'A' }); // order
    const result = await service.printReceipt('store1', 'pay1');
    expect(result.status).toBe('success');
    expect(result.pdfUrl).toBe('pdf-url');
    expect(result.data.data.customerName).toBe('A');
  });

  it('printReceipt trả về customerName Unknown nếu không có order', async () => {
    mockRepo.findOne
      .mockResolvedValueOnce({ id: 'pay1', order_id: 'order1', amount: 100, created_at: new Date(), order: null, payment_method: {}, paid_by_user: {} }) // payment
      .mockResolvedValueOnce(null); // order
    const result = await service.printReceipt('store1', 'pay1');
    expect(result.data.data.customerName).toBe('Unknown');
  });

  // printBarcode
  it('printBarcode throw nếu thiếu productId', async () => {
    await expect(service.printBarcode('store1', '')).rejects.toThrow(BadRequestException);
  });

  it('printBarcode throw nếu không có product', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null); // product
    await expect(service.printBarcode('store1', 'prod1')).rejects.toThrow(NotFoundException);
  });

  it('printBarcode trả về đúng barcode nếu có product_code', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ product_code: 'CODE123', product_id: 'prod1' });
    const result = await service.printBarcode('store1', 'prod1');
    expect(result.status).toBe('success');
    expect(result.barcode).toBe('CODE123');
    expect(result.barcodeUrl).toBe('barcode-url');
  });

  it('printBarcode trả về product_id nếu không có product_code', async () => {
    mockRepo.findOne.mockResolvedValueOnce({ product_code: '', product_id: 'prod1' });
    const result = await service.printBarcode('store1', 'prod1');
    expect(result.barcode).toBe('prod1');
  });

  // printQuotation
  it('printQuotation throw nếu thiếu customerName hoặc items rỗng', async () => {
    await expect(service.printQuotation('store1', { id: 'q1', customerName: '', customerEmail: '', items: [] })).rejects.toThrow(BadRequestException);
  });

  it('printQuotation throw nếu item thiếu name/quantity/price', async () => {
    await expect(service.printQuotation('store1', { id: 'q1', customerName: 'A', customerEmail: '', items: [{ name: '', quantity: 1, price: 1 }] })).rejects.toThrow(BadRequestException);
    await expect(service.printQuotation('store1', { id: 'q1', customerName: 'A', customerEmail: '', items: [{ name: 'A', quantity: 0, price: 1 }] })).rejects.toThrow(BadRequestException);
    await expect(service.printQuotation('store1', { id: 'q1', customerName: 'A', customerEmail: '', items: [{ name: 'A', quantity: 1, price: 0 }] })).rejects.toThrow(BadRequestException);
  });

  it('printQuotation trả về đúng dữ liệu khi hợp lệ', async () => {
    const items = [{ name: 'A', quantity: 2, price: 10 }];
    const result = await service.printQuotation('store1', { id: 'q1', customerName: 'A', customerEmail: 'a@mail.com', items });
    expect(result.status).toBe('success');
    expect(result.pdfUrl).toBe('pdf-url');
    expect(result.data.data.customerName).toBe('A');
    expect(result.data.data.items.length).toBe(1);
    expect(result.data.data.total).toBeGreaterThan(0);
  });
}); 