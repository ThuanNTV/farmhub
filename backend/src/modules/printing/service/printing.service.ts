import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Customer } from 'src/entities/tenant/customer.entity';
import { Order } from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { Payment } from 'src/entities/tenant/payment.entity';
import { Product } from 'src/entities/tenant/product.entity';
import {
  QuotationData,
  QuotationItem,
  PrintData,
  BarcodeData,
} from 'src/common/types/common.types';

@Injectable()
export class PrintingService {
  constructor(private readonly tenantDS: TenantDataSourceService) {}

  async printInvoice(storeId: string, orderId: string) {
    // Validate input
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    // Get order data from database
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const orderRepo = ds.getRepository(Order);
    const orderItemRepo = ds.getRepository(OrderItem);
    const customerRepo = ds.getRepository(Customer);

    const order = (await orderRepo.findOne({
      where: { order_id: orderId, is_deleted: false },
      relations: ['customer', 'payment_method'],
    })) as Order;

    // Get order items
    const orderItems: OrderItem[] = await orderItemRepo.find({
      where: { order_id: orderId, is_deleted: false },
      relations: ['product'],
    });

    // Get customer details
    const customer = await customerRepo.findOne({
      where: { customer_id: order.customer_id, is_deleted: false },
    });

    // Generate invoice data
    const invoiceData: PrintData = {
      type: 'invoice',
      data: {
        id: order.order_id,
        customerName: customer?.name ?? 'Unknown',
        customerEmail: customer?.email,
        items: orderItems.map((item) => ({
          id: item.order_item_id,
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
          total: item.total_price,
        })),
        subtotal: order.total_amount,
        tax: 0,
        total: order.total_amount,
        createdAt: order.created_at,
      },
    };

    // Generate PDF (simulated - in real implementation, use PDF library)
    const pdfUrl = await this.generatePDF(invoiceData.type, invoiceData.data);

    return {
      status: 'success',
      message: 'Invoice generated successfully',
      invoiceId: orderId,
      pdfUrl,
      data: invoiceData,
    };
  }

  async printReceipt(storeId: string, paymentId: string) {
    // Validate input
    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }

    // Get payment data from database
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const paymentRepo = ds.getRepository('payment');
    const orderRepo = ds.getRepository('order');

    const payment = (await paymentRepo.findOne({
      where: { id: paymentId, is_deleted: false },
      relations: ['order', 'payment_method', 'paid_by_user'],
    })) as Payment | null;

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Get order details
    const order = (await orderRepo.findOne({
      where: { order_id: payment.order_id, is_deleted: false },
      relations: ['customer'],
    })) as Order | null;

    // Generate receipt data
    const receiptData: PrintData = {
      type: 'receipt',
      data: {
        id: payment.id,
        customerName: order?.customer ?? 'Unknown',
        customerEmail: order?.customer,
        items: [],
        subtotal: payment.amount,
        tax: 0,
        total: payment.amount,
        createdAt: payment.created_at,
      },
    };

    // Generate PDF (simulated)
    const pdfUrl = await this.generatePDF(receiptData.type, receiptData.data);

    return {
      status: 'success',
      message: 'Receipt generated successfully',
      receiptId: paymentId,
      pdfUrl,
      data: receiptData,
    };
  }

  async printBarcode(storeId: string, productId: string) {
    // Validate input
    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    // Get product data from database
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const productRepo = ds.getRepository('product');

    const product = (await productRepo.findOne({
      where: { productId, is_deleted: false },
    })) as Product | null;

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Generate barcode data
    const barcodeData: BarcodeData = {
      text: product.product_code || product.product_id,
      format: 'CODE128',
    };

    // Generate barcode image (simulated - in real implementation, use barcode library)
    const barcodeUrl = await this.generateBarcode(barcodeData);

    return {
      status: 'success',
      message: 'Barcode generated successfully',
      barcode: product.product_code || product.product_id,
      barcodeUrl,
      data: barcodeData,
    };
  }

  async printQuotation(storeId: string, quotationData: QuotationData) {
    // Validate input
    if (!quotationData.customerName || quotationData.items.length === 0) {
      throw new BadRequestException('Customer name and items are required');
    }

    // Validate items
    for (const item of quotationData.items) {
      if (!item.name || !item.quantity || !item.price) {
        throw new BadRequestException(
          'Each item must have name, quantity, and price',
        );
      }
    }

    // Calculate totals
    const subtotal = quotationData.items.reduce(
      (sum: number, item: QuotationItem) => {
        return sum + item.quantity * item.price;
      },
      0,
    );

    const tax = subtotal * 0.1; // 10% tax (adjust based on business rules)
    const total = subtotal + tax;

    // Generate quotation data
    const quotation: PrintData = {
      type: 'quotation',
      data: {
        id: quotationData.id,
        customerName: quotationData.customerName,
        customerEmail: quotationData.customerEmail,
        items: quotationData.items,
        subtotal,
        tax,
        total,
        createdAt: new Date(),
      },
    };

    // Generate PDF (simulated)
    const pdfUrl = await this.generatePDF(quotation.type, quotation.data);

    return {
      status: 'success',
      message: 'Quotation generated successfully',
      quotationId: quotation.data.id,
      pdfUrl,
      data: quotation,
    };
  }

  private async generatePDF(
    type: string,
    _: PrintData['data'],
  ): Promise<string> {
    // Simulated PDF generation
    // In real implementation, use libraries like PDFKit, jsPDF, or Puppeteer
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}.pdf`;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    return `https://api.example.com/files/${filename}`;
  }

  private async generateBarcode(data: BarcodeData): Promise<string> {
    // Simulated barcode generation
    // In real implementation, use libraries like jsbarcode or similar
    const timestamp = Date.now();
    const filename = `barcode_${data.text}_${timestamp}.png`;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 50));

    return `https://api.example.com/barcodes/${filename}`;
  }
}
