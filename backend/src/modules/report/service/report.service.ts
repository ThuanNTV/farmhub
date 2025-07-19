import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ReportData } from 'src/common/types/common.types';

// Interface cho từng loại kết quả trả về từ getRawOne/getRawMany
interface RevenueTotalRow {
  total: string;
}
interface RevenueByDayRow {
  date: string;
  revenue: string;
  order_count: string;
}
interface RevenueByPaymentMethodRow {
  method: string;
  revenue: string;
  count: string;
}
interface OrdersTotalRow {
  total: string;
}
interface OrdersByStatusRow {
  status: string;
  count: string;
  total_amount: string;
}
interface OrdersByDayRow {
  date: string;
  count: string;
  total_amount: string;
}
interface CustomersTotalRow {
  total: string;
}
interface NewCustomersRow {
  count: string;
}
interface TopCustomerRow {
  name: string;
  email: string;
  phone: string;
  order_count: string;
  total_spent: string;
}
interface BestSellingProductRow {
  name: string;
  sku: string;
  total_quantity: string;
  total_revenue: string;
}
interface InventoryProductRow {
  name: string;
  sku: string;
  stock_quantity: number;
  price_retail: number;
}

@Injectable()
export class ReportService {
  constructor(private readonly tenantDS: TenantDataSourceService) {}

  async exportReport(storeId: string, type: string, from: string, to: string) {
    // Validate parameters
    this.validateDateRange(from, to);
    this.validateReportType(type);

    let reportData: unknown;
    let fileName: string;

    switch (type) {
      case 'revenue':
        reportData = await this.generateRevenueReport(storeId, from, to);
        fileName = `revenue_report_${from}_${to}`;
        break;
      case 'orders':
        reportData = await this.generateOrdersReport(storeId, from, to);
        fileName = `orders_report_${from}_${to}`;
        break;
      case 'customers':
        reportData = await this.generateCustomersReport(storeId, from, to);
        fileName = `customers_report_${from}_${to}`;
        break;
      case 'products':
        reportData = await this.generateProductsReport(storeId, from, to);
        fileName = `products_report_${from}_${to}`;
        break;
      case 'inventory':
        reportData = await this.generateInventoryReport(storeId, from, to);
        fileName = `inventory_report_${from}_${to}`;
        break;
      default:
        throw new BadRequestException(`Unsupported report type: ${type}`);
    }

    // Generate file (simulated - in real implementation, use Excel/PDF library)
    const fileUrl = await this.generateFile(
      type,
      reportData as ReportData,
      fileName,
    );

    return {
      type,
      from,
      to,
      data: reportData,
      fileUrl,
      fileName: `${fileName}.xlsx`,
    };
  }

  getReportTypes() {
    return [
      {
        key: 'revenue',
        name: 'Báo cáo doanh thu',
        description: 'Tổng hợp doanh thu theo thời gian',
      },
      {
        key: 'orders',
        name: 'Báo cáo đơn hàng',
        description: 'Thống kê đơn hàng theo trạng thái',
      },
      {
        key: 'customers',
        name: 'Báo cáo khách hàng',
        description: 'Phân tích khách hàng và doanh thu',
      },
      {
        key: 'products',
        name: 'Báo cáo sản phẩm',
        description: 'Sản phẩm bán chạy và hiệu suất',
      },
      {
        key: 'inventory',
        name: 'Báo cáo tồn kho',
        description: 'Tình trạng tồn kho hiện tại',
      },
    ];
  }

  async previewReport(storeId: string, type: string, from: string, to: string) {
    // Validate parameters
    this.validateDateRange(from, to);
    this.validateReportType(type);

    let previewData: unknown;

    switch (type) {
      case 'revenue':
        previewData = await this.generateRevenueReport(storeId, from, to);
        break;
      case 'orders':
        previewData = await this.generateOrdersReport(storeId, from, to);
        break;
      case 'customers':
        previewData = await this.generateCustomersReport(storeId, from, to);
        break;
      case 'products':
        previewData = await this.generateProductsReport(storeId, from, to);
        break;
      case 'inventory':
        previewData = await this.generateInventoryReport(storeId, from, to);
        break;
      default:
        throw new BadRequestException(`Unsupported report type: ${type}`);
    }

    return {
      type,
      from,
      to,
      preview: previewData,
    };
  }

  private async generateRevenueReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const orderRepo = ds.getRepository('order');

    // Get total revenue
    const totalRevenue = await orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .getRawOne<RevenueTotalRow>();

    // Get revenue by day
    const revenueByDay = await orderRepo
      .createQueryBuilder('order')
      .select([
        'DATE(order.createdAt) as date',
        'SUM(order.total_amount) as revenue',
        'COUNT(*) as order_count',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)')
      .getRawMany<RevenueByDayRow>();

    // Get revenue by payment method
    const revenueByPaymentMethod = await orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.payment_method', 'payment_method')
      .select([
        'payment_method.name as method',
        'SUM(order.total_amount) as revenue',
        'COUNT(*) as count',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('payment_method.name')
      .getRawMany<RevenueByPaymentMethodRow>();

    return {
      total: totalRevenue ? parseFloat(totalRevenue.total) || 0 : 0,
      byDay: revenueByDay.map((item) => ({
        date: item.date,
        revenue: parseFloat(item.revenue),
        order_count: parseInt(item.order_count),
      })),
      byPaymentMethod: revenueByPaymentMethod.map((item) => ({
        method: item.method,
        revenue: parseFloat(item.revenue),
        count: parseInt(item.count),
      })),
    };
  }

  private async generateOrdersReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const orderRepo = ds.getRepository('order');

    // Get total orders
    const totalOrders = await orderRepo
      .createQueryBuilder('order')
      .select('COUNT(*)', 'total')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .getRawOne<OrdersTotalRow>();

    // Get orders by status
    const ordersByStatus = await orderRepo
      .createQueryBuilder('order')
      .select([
        'order.status',
        'COUNT(*) as count',
        'SUM(order.total_amount) as total_amount',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('order.status')
      .getRawMany<OrdersByStatusRow>();

    // Get orders by day
    const ordersByDay = await orderRepo
      .createQueryBuilder('order')
      .select([
        'DATE(order.createdAt) as date',
        'COUNT(*) as count',
        'SUM(order.total_amount) as total_amount',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)')
      .getRawMany<OrdersByDayRow>();

    return {
      total: totalOrders ? parseInt(totalOrders.total) || 0 : 0,
      byStatus: ordersByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count) || 0,
        total_amount: parseFloat(item.total_amount) || 0,
      })),
      byDay: ordersByDay.map((item) => ({
        date: item.date,
        count: parseInt(item.count) || 0,
        total_amount: parseFloat(item.total_amount) || 0,
      })),
    };
  }

  private async generateCustomersReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const customerRepo = ds.getRepository('customer');
    const orderRepo = ds.getRepository('order');

    // Get total customers
    const totalCustomers = await customerRepo
      .createQueryBuilder('customer')
      .select('COUNT(*)', 'total')
      .where('customer.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('customer.isDeleted = :isDeleted', { isDeleted: false })
      .getRawOne<CustomersTotalRow>();

    // Get new customers
    const newCustomers = await customerRepo
      .createQueryBuilder('customer')
      .select('COUNT(*)', 'count')
      .where('customer.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('customer.isDeleted = :isDeleted', { isDeleted: false })
      .getRawOne<NewCustomersRow>();

    // Get top customers by spending
    const topCustomers = await orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .select([
        'customer.name',
        'customer.email',
        'customer.phone',
        'COUNT(*) as order_count',
        'SUM(order.total_amount) as total_spent',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy(
        'customer.customerId, customer.name, customer.email, customer.phone',
      )
      .orderBy('total_spent', 'DESC')
      .limit(10)
      .getRawMany<TopCustomerRow>();

    return {
      total: totalCustomers ? parseInt(totalCustomers.total) || 0 : 0,
      newCustomers: newCustomers ? parseInt(newCustomers.count) || 0 : 0,
      topCustomers: topCustomers.map((customer) => ({
        name: customer.name || 'Unknown',
        email: customer.email,
        phone: customer.phone,
        order_count: parseInt(customer.order_count) || 0,
        total_spent: parseFloat(customer.total_spent) || 0,
      })),
    };
  }

  private async generateProductsReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const orderItemRepo = ds.getRepository('orderItem');

    // Get best selling products
    const bestSelling = await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.name',
        'product.sku',
        'SUM(item.quantity) as total_quantity',
        'SUM(item.totalPrice) as total_revenue',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('product.productId, product.name, product.sku')
      .orderBy('total_quantity', 'DESC')
      .limit(20)
      .getRawMany<BestSellingProductRow>();

    return {
      bestSelling: bestSelling.map((product) => ({
        name: product.name,
        sku: product.sku,
        quantity: parseInt(product.total_quantity),
        revenue: parseFloat(product.total_revenue),
      })),
    };
  }

  private async generateInventoryReport(
    storeId: string,
    _from: string,
    _to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const productRepo = ds.getRepository('product');

    // Get current inventory
    const inventory = await productRepo
      .createQueryBuilder('product')
      .select([
        'product.name',
        'product.sku',
        'product.stock_quantity',
        'product.price_retail',
      ])
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('product.stock_quantity', 'ASC')
      .getRawMany<InventoryProductRow>();

    // Calculate inventory value
    const totalValue = inventory.reduce((sum, product) => {
      return sum + product.stock_quantity * product.price_retail;
    }, 0);

    // Get low stock products
    const lowStock = inventory.filter((product) => product.stock_quantity < 10);

    return {
      total_products: inventory.length,
      total_value: totalValue,
      low_stock_count: lowStock.length,
      inventory: inventory.map((product) => ({
        name: product.name,
        sku: product.sku,
        stock: product.stock_quantity,
        price: product.price_retail,
        value: product.stock_quantity * product.price_retail,
      })),
      low_stock: lowStock.map((product) => ({
        name: product.name,
        sku: product.sku,
        stock: product.stock_quantity,
        price: product.price_retail,
      })),
    };
  }

  private async generateFile(
    type: string,
    data: ReportData,
    fileName: string,
    _from?: string,
    _to?: string,
  ): Promise<string> {
    // Simulated file generation
    // In real implementation, use libraries like ExcelJS, jsPDF, or similar
    const timestamp = Date.now();
    const fileUrl = `https://api.example.com/reports/${fileName}_${timestamp}.xlsx`;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 200));

    return fileUrl;
  }

  private validateDateRange(from: string, to: string): void {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
      );
    }

    if (fromDate > toDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  private validateReportType(type: string): void {
    const validTypes = [
      'revenue',
      'orders',
      'customers',
      'products',
      'inventory',
    ];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid report type. Supported types: ${validTypes.join(', ')}`,
      );
    }
  }
}
