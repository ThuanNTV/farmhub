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
  [x: string]: any;
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
      case 'product-performance':
        reportData = await this.generateProductPerformanceReport(
          storeId,
          from,
          to,
        );
        fileName = `product_performance_report_${from}_${to}`;
        break;
      case 'product-analytics':
        reportData = await this.generateProductAnalyticsReport(
          storeId,
          from,
          to,
        );
        fileName = `product_analytics_report_${from}_${to}`;
        break;
      case 'inventory-analysis':
        reportData = await this.generateInventoryAnalysisReport(
          storeId,
          from,
          to,
        );
        fileName = `inventory_analysis_report_${from}_${to}`;
        break;
      case 'price-trends':
        reportData = await this.generatePriceTrendsReport(storeId, from, to);
        fileName = `price_trends_report_${from}_${to}`;
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
      {
        key: 'product-performance',
        name: 'Báo cáo hiệu suất sản phẩm',
        description: 'Phân tích hiệu suất và xu hướng sản phẩm',
      },
      {
        key: 'product-analytics',
        name: 'Báo cáo phân tích sản phẩm',
        description: 'Thống kê chi tiết về sản phẩm và danh mục',
      },
      {
        key: 'inventory-analysis',
        name: 'Báo cáo phân tích tồn kho',
        description: 'Phân tích sâu về tình trạng tồn kho và luân chuyển',
      },
      {
        key: 'price-trends',
        name: 'Báo cáo xu hướng giá',
        description: 'Theo dõi và phân tích xu hướng thay đổi giá',
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
      case 'product-performance':
        previewData = await this.generateProductPerformanceReport(
          storeId,
          from,
          to,
        );
        break;
      case 'product-analytics':
        previewData = await this.generateProductAnalyticsReport(
          storeId,
          from,
          to,
        );
        break;
      case 'inventory-analysis':
        previewData = await this.generateInventoryAnalysisReport(
          storeId,
          from,
          to,
        );
        break;
      case 'price-trends':
        previewData = await this.generatePriceTrendsReport(storeId, from, to);
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
      'product-performance',
      'product-analytics',
      'inventory-analysis',
      'price-trends',
    ];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid report type. Supported types: ${validTypes.join(', ')}`,
      );
    }
  }

  // Advanced Product Reports
  private async generateProductPerformanceReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const productRepo = ds.getRepository('product');
    const orderItemRepo = ds.getRepository('orderItem');

    // Get product performance metrics
    const productPerformance = await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.productId as product_id',
        'product.name',
        'product.sku',
        'product.category_id',
        'product.brand',
        'SUM(item.quantity) as total_sold',
        'SUM(item.totalPrice) as total_revenue',
        'AVG(item.unitPrice) as avg_price',
        'COUNT(DISTINCT order.orderId) as order_count',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy(
        'product.productId, product.name, product.sku, product.category_id, product.brand',
      )
      .orderBy('total_revenue', 'DESC')
      .getRawMany();

    // Get current inventory status
    const inventoryStatus = await productRepo
      .createQueryBuilder('product')
      .select([
        'COUNT(*) as total_products',
        'SUM(CASE WHEN stock_quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count',
        'SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count',
        'SUM(stock_quantity * price_retail) as total_inventory_value',
        'AVG(price_retail) as avg_price',
      ])
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .getRawOne();

    // Calculate performance metrics
    const totalRevenue = productPerformance.reduce(
      (sum, p) => sum + parseFloat(p.total_revenue || 0),
      0,
    );
    const totalQuantitySold = productPerformance.reduce(
      (sum, p) => sum + parseInt(p.total_sold || 0),
      0,
    );

    return {
      summary: {
        total_products_sold: productPerformance.length,
        total_revenue: totalRevenue,
        total_quantity_sold: totalQuantitySold,
        average_order_value:
          totalRevenue /
          (productPerformance.reduce(
            (sum, p) => sum + parseInt(p.order_count || 0),
            0,
          ) || 1),
        inventory_status: {
          total_products: parseInt(inventoryStatus?.total_products || 0),
          low_stock_count: parseInt(inventoryStatus?.low_stock_count || 0),
          out_of_stock_count: parseInt(
            inventoryStatus?.out_of_stock_count || 0,
          ),
          total_inventory_value: parseFloat(
            inventoryStatus?.total_inventory_value || 0,
          ),
          avg_price: parseFloat(inventoryStatus?.avg_price || 0),
        },
      },
      top_performers: productPerformance.slice(0, 20).map((p) => ({
        product_id: p.product_id,
        name: p.name,
        sku: p.sku,
        category_id: p.category_id,
        brand: p.brand,
        total_sold: parseInt(p.total_sold || 0),
        total_revenue: parseFloat(p.total_revenue || 0),
        avg_price: parseFloat(p.avg_price || 0),
        order_count: parseInt(p.order_count || 0),
        revenue_per_order:
          parseFloat(p.total_revenue || 0) / parseInt(p.order_count || 1),
      })),
      category_performance: await this.getCategoryPerformance(ds, from, to),
      brand_performance: await this.getBrandPerformance(ds, from, to),
    };
  }

  private async generateProductAnalyticsReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const productRepo = ds.getRepository('product');

    // Product creation trends
    const creationTrends = await productRepo
      .createQueryBuilder('product')
      .select([
        'DATE(product.createdAt) as date',
        'COUNT(*) as products_created',
        'AVG(product.price_retail) as avg_price',
        'SUM(product.price_retail * product.stock_quantity) as total_value',
      ])
      .where('product.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('product.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('DATE(product.createdAt)')
      .orderBy('DATE(product.createdAt)')
      .getRawMany();

    // Price distribution analysis
    const priceDistribution = await productRepo
      .createQueryBuilder('product')
      .select([
        'CASE ' +
          'WHEN price_retail < 50000 THEN "Under 50K" ' +
          'WHEN price_retail < 100000 THEN "50K-100K" ' +
          'WHEN price_retail < 500000 THEN "100K-500K" ' +
          'WHEN price_retail < 1000000 THEN "500K-1M" ' +
          'ELSE "Over 1M" END as price_range',
        'COUNT(*) as product_count',
        'SUM(stock_quantity) as total_stock',
        'SUM(price_retail * stock_quantity) as total_value',
      ])
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('price_range')
      .getRawMany();

    // Stock level analysis
    const stockAnalysis = await productRepo
      .createQueryBuilder('product')
      .select([
        'CASE ' +
          'WHEN stock_quantity = 0 THEN "Out of Stock" ' +
          'WHEN stock_quantity <= min_stock_level THEN "Low Stock" ' +
          'WHEN stock_quantity <= min_stock_level * 2 THEN "Normal Stock" ' +
          'ELSE "High Stock" END as stock_level',
        'COUNT(*) as product_count',
        'SUM(price_retail * stock_quantity) as total_value',
      ])
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('stock_level')
      .getRawMany();

    return {
      creation_trends: creationTrends.map((trend) => ({
        date: trend.date,
        products_created: parseInt(trend.products_created),
        avg_price: parseFloat(trend.avg_price || 0),
        total_value: parseFloat(trend.total_value || 0),
      })),
      price_distribution: priceDistribution.map((dist) => ({
        price_range: dist.price_range,
        product_count: parseInt(dist.product_count),
        total_stock: parseInt(dist.total_stock || 0),
        total_value: parseFloat(dist.total_value || 0),
      })),
      stock_analysis: stockAnalysis.map((analysis) => ({
        stock_level: analysis.stock_level,
        product_count: parseInt(analysis.product_count),
        total_value: parseFloat(analysis.total_value || 0),
      })),
    };
  }

  private async generateInventoryAnalysisReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const productRepo = ds.getRepository('product');
    const orderItemRepo = ds.getRepository('orderItem');

    // Inventory turnover analysis
    const turnoverAnalysis = await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.productId as product_id',
        'product.name',
        'product.stock_quantity as current_stock',
        'SUM(item.quantity) as total_sold',
        'AVG(product.stock_quantity) as avg_stock',
        'SUM(item.quantity) / NULLIF(AVG(product.stock_quantity), 0) as turnover_ratio',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('product.productId, product.name, product.stock_quantity')
      .having('SUM(item.quantity) > 0')
      .orderBy('turnover_ratio', 'DESC')
      .getRawMany();

    // ABC Analysis (based on revenue contribution)
    const abcAnalysis = await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.productId as product_id',
        'product.name',
        'SUM(item.totalPrice) as total_revenue',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('product.productId, product.name')
      .orderBy('total_revenue', 'DESC')
      .getRawMany();

    // Calculate ABC categories
    const totalRevenue = abcAnalysis.reduce(
      (sum, item) => sum + parseFloat(item.total_revenue),
      0,
    );
    let cumulativeRevenue = 0;
    const abcCategorized = abcAnalysis.map((item) => {
      cumulativeRevenue += parseFloat(item.total_revenue);
      const percentage = (cumulativeRevenue / totalRevenue) * 100;
      let category = 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';

      return {
        ...item,
        total_revenue: parseFloat(item.total_revenue),
        cumulative_percentage: percentage,
        abc_category: category,
      };
    });

    return {
      turnover_analysis: turnoverAnalysis.slice(0, 50).map((item) => ({
        product_id: item.product_id,
        name: item.name,
        current_stock: parseInt(item.current_stock || 0),
        total_sold: parseInt(item.total_sold || 0),
        avg_stock: parseFloat(item.avg_stock || 0),
        turnover_ratio: parseFloat(item.turnover_ratio || 0),
        turnover_days:
          item.turnover_ratio > 0
            ? Math.round(365 / parseFloat(item.turnover_ratio))
            : 0,
      })),
      abc_analysis: {
        category_a: abcCategorized.filter((item) => item.abc_category === 'A'),
        category_b: abcCategorized.filter((item) => item.abc_category === 'B'),
        category_c: abcCategorized.filter((item) => item.abc_category === 'C'),
        summary: {
          total_products: abcCategorized.length,
          category_a_count: abcCategorized.filter(
            (item) => item.abc_category === 'A',
          ).length,
          category_b_count: abcCategorized.filter(
            (item) => item.abc_category === 'B',
          ).length,
          category_c_count: abcCategorized.filter(
            (item) => item.abc_category === 'C',
          ).length,
        },
      },
    };
  }

  private async generatePriceTrendsReport(
    storeId: string,
    from: string,
    to: string,
  ) {
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const priceHistoryRepo = ds.getRepository('priceHistory');
    const productRepo = ds.getRepository('product');

    // Price change trends over time
    const priceTrends = await priceHistoryRepo
      .createQueryBuilder('ph')
      .select([
        'DATE(ph.changedAt) as date',
        'COUNT(*) as total_changes',
        'SUM(CASE WHEN ph.newPrice > ph.oldPrice THEN 1 ELSE 0 END) as price_increases',
        'SUM(CASE WHEN ph.newPrice < ph.oldPrice THEN 1 ELSE 0 END) as price_decreases',
        'AVG(((ph.newPrice - ph.oldPrice) / ph.oldPrice) * 100) as avg_percentage_change',
        'MAX(((ph.newPrice - ph.oldPrice) / ph.oldPrice) * 100) as max_increase',
        'MIN(((ph.newPrice - ph.oldPrice) / ph.oldPrice) * 100) as max_decrease',
      ])
      .where('ph.changedAt BETWEEN :from AND :to', { from, to })
      .groupBy('DATE(ph.changedAt)')
      .orderBy('DATE(ph.changedAt)')
      .getRawMany();

    // Most volatile products (frequent price changes)
    const volatileProducts = await priceHistoryRepo
      .createQueryBuilder('ph')
      .leftJoin('ph.product', 'product')
      .select([
        'ph.productId as product_id',
        'product.name',
        'product.sku',
        'COUNT(*) as change_count',
        'AVG(ABS((ph.newPrice - ph.oldPrice) / ph.oldPrice) * 100) as avg_volatility',
        'MAX(ph.newPrice) as max_price',
        'MIN(ph.newPrice) as min_price',
        'MAX(ph.newPrice) - MIN(ph.newPrice) as price_range',
      ])
      .where('ph.changedAt BETWEEN :from AND :to', { from, to })
      .groupBy('ph.productId, product.name, product.sku')
      .having('COUNT(*) > 1')
      .orderBy('change_count', 'DESC')
      .addOrderBy('avg_volatility', 'DESC')
      .limit(20)
      .getRawMany();

    // Price distribution by category
    const categoryPriceAnalysis = await productRepo
      .createQueryBuilder('product')
      .select([
        'product.category_id',
        'COUNT(*) as product_count',
        'AVG(product.price_retail) as avg_price',
        'MIN(product.price_retail) as min_price',
        'MAX(product.price_retail) as max_price',
        'STDDEV(product.price_retail) as price_stddev',
      ])
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('product.category_id')
      .orderBy('avg_price', 'DESC')
      .getRawMany();

    return {
      price_trends: priceTrends.map((trend) => ({
        date: trend.date,
        total_changes: parseInt(trend.total_changes),
        price_increases: parseInt(trend.price_increases || 0),
        price_decreases: parseInt(trend.price_decreases || 0),
        avg_percentage_change: parseFloat(trend.avg_percentage_change || 0),
        max_increase: parseFloat(trend.max_increase || 0),
        max_decrease: parseFloat(trend.max_decrease || 0),
      })),
      volatile_products: volatileProducts.map((product) => ({
        product_id: product.product_id,
        name: product.name,
        sku: product.sku,
        change_count: parseInt(product.change_count),
        avg_volatility: parseFloat(product.avg_volatility || 0),
        max_price: parseFloat(product.max_price || 0),
        min_price: parseFloat(product.min_price || 0),
        price_range: parseFloat(product.price_range || 0),
        volatility_score:
          parseFloat(product.avg_volatility || 0) *
          parseInt(product.change_count),
      })),
      category_price_analysis: categoryPriceAnalysis.map((category) => ({
        category_id: category.category_id,
        product_count: parseInt(category.product_count),
        avg_price: parseFloat(category.avg_price || 0),
        min_price: parseFloat(category.min_price || 0),
        max_price: parseFloat(category.max_price || 0),
        price_stddev: parseFloat(category.price_stddev || 0),
        price_coefficient_variation:
          parseFloat(category.price_stddev || 0) /
          parseFloat(category.avg_price || 1),
      })),
    };
  }

  // Helper methods for advanced reports
  private async getCategoryPerformance(ds: any, from: string, to: string) {
    const orderItemRepo = ds.getRepository('orderItem');

    return await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.category_id',
        'COUNT(DISTINCT product.productId) as product_count',
        'SUM(item.quantity) as total_sold',
        'SUM(item.totalPrice) as total_revenue',
        'AVG(item.unitPrice) as avg_price',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .groupBy('product.category_id')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          category_id: result.category_id,
          product_count: parseInt(result.product_count),
          total_sold: parseInt(result.total_sold || 0),
          total_revenue: parseFloat(result.total_revenue || 0),
          avg_price: parseFloat(result.avg_price || 0),
        })),
      );
  }

  private async getBrandPerformance(ds: any, from: string, to: string) {
    const orderItemRepo = ds.getRepository('orderItem');

    return await orderItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select([
        'product.brand',
        'COUNT(DISTINCT product.productId) as product_count',
        'SUM(item.quantity) as total_sold',
        'SUM(item.totalPrice) as total_revenue',
        'AVG(item.unitPrice) as avg_price',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.status = :status', { status: 'completed' })
      .andWhere('product.brand IS NOT NULL')
      .groupBy('product.brand')
      .orderBy('total_revenue', 'DESC')
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          brand: result.brand,
          product_count: parseInt(result.product_count),
          total_sold: parseInt(result.total_sold || 0),
          total_revenue: parseFloat(result.total_revenue || 0),
          avg_price: parseFloat(result.avg_price || 0),
        })),
      );
  }
}
