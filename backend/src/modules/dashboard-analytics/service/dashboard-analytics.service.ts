import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

// Interface cho từng loại kết quả trả về từ getRawMany
interface HeatmapRow {
  hour: string;
  day: string;
  value: string;
}

interface ChartRow {
  label: string;
  value: string;
}

interface IndustryRow {
  industry: string;
  count: string;
  total_value: string;
}

interface TrendRow {
  date: string;
  order_count: string;
  total_sales: string;
  avg_order_value: string;
}

interface TopCustomerRow {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  order_count: string;
  total_spent: string;
}

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly tenantDS: TenantDataSourceService) {}

  async getHeatmap(storeId: string, from: string, to: string) {
    // Validate date parameters
    this.validateDateRange(from, to);

    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const repo = ds.getRepository('order');

    const heatmapData = await repo
      .createQueryBuilder('order')
      .select([
        'EXTRACT(HOUR FROM order.createdAt) as hour',
        'EXTRACT(DOW FROM order.createdAt) as day',
        'COUNT(*) as value',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('hour, day')
      .getRawMany<HeatmapRow>();

    return {
      from,
      to,
      heatmap: heatmapData.map((item) => ({
        x: parseInt(item.hour),
        y: parseInt(item.day),
        value: parseInt(item.value),
      })),
    };
  }

  async getChart(storeId: string, type: string, from: string, to: string) {
    // Validate parameters
    this.validateDateRange(from, to);
    this.validateChartType(type);

    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const repo = ds.getRepository('order');

    let chartData: ChartRow[] = [];

    switch (type) {
      case 'sales_by_category':
        chartData = await repo
          .createQueryBuilder('order')
          .leftJoin('order.orderItems', 'item')
          .leftJoin('item.product', 'product')
          .leftJoin('product.category', 'category')
          .select(['category.name as label', 'SUM(item.totalPrice) as value'])
          .where('order.createdAt BETWEEN :from AND :to', { from, to })
          .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
          .groupBy('category.name')
          .getRawMany<ChartRow>();
        break;

      case 'sales_by_payment_method':
        chartData = await repo
          .createQueryBuilder('order')
          .leftJoin('order.payment_method', 'payment_method')
          .select(['payment_method.name as label', 'COUNT(*) as value'])
          .where('order.createdAt BETWEEN :from AND :to', { from, to })
          .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
          .groupBy('payment_method.name')
          .getRawMany<ChartRow>();
        break;

      case 'daily_sales':
        chartData = await repo
          .createQueryBuilder('order')
          .select([
            'DATE(order.createdAt) as label',
            'SUM(order.total_amount) as value',
          ])
          .where('order.createdAt BETWEEN :from AND :to', { from, to })
          .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
          .groupBy('DATE(order.createdAt)')
          .orderBy('DATE(order.createdAt)')
          .getRawMany<ChartRow>();
        break;

      default:
        throw new BadRequestException(`Unsupported chart type: ${type}`);
    }

    return {
      type,
      from,
      to,
      chart: chartData.map((item) => ({
        label: item.label,
        value: parseFloat(item.value) || 0,
      })),
    };
  }

  async getIndustryAnalytics(storeId: string, from: string, to: string) {
    // Validate date parameters
    this.validateDateRange(from, to);

    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const repo = ds.getRepository('order');

    const industryData = await repo
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .select([
        'customer.industry as industry',
        'COUNT(*) as count',
        'SUM(order.total_amount) as total_value',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('customer.industry IS NOT NULL')
      .groupBy('customer.industry')
      .getRawMany<IndustryRow>();

    return {
      from,
      to,
      industries: industryData.map((item) => ({
        industry: item.industry,
        count: parseInt(item.count),
        value: parseFloat(item.total_value) || 0,
      })),
    };
  }

  async getTrend(storeId: string, from: string, to: string) {
    // Validate date parameters
    this.validateDateRange(from, to);

    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const repo = ds.getRepository('order');

    const trendData = await repo
      .createQueryBuilder('order')
      .select([
        'DATE(order.createdAt) as date',
        'COUNT(*) as order_count',
        'SUM(order.total_amount) as total_sales',
        'AVG(order.total_amount) as avg_order_value',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)')
      .getRawMany<TrendRow>();

    return {
      from,
      to,
      trend: trendData.map((item) => ({
        date: item.date,
        order_count: parseInt(item.order_count),
        total_sales: parseFloat(item.total_sales) || 0,
        avg_order_value: parseFloat(item.avg_order_value) || 0,
      })),
    };
  }

  async getTopCustomers(
    storeId: string,
    from: string,
    to: string,
    limit: number = 10,
  ) {
    // Validate date parameters
    this.validateDateRange(from, to);

    const ds = await this.tenantDS.getTenantDataSource(storeId);
    const repo = ds.getRepository('order');

    const topCustomers = await repo
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .select([
        'customer.customerId',
        'customer.name',
        'customer.email',
        'customer.phone',
        'COUNT(*) as order_count',
        'SUM(order.total_amount) as total_spent',
      ])
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy(
        'customer.customerId, customer.name, customer.email, customer.phone',
      )
      .orderBy('total_spent', 'DESC')
      .limit(limit)
      .getRawMany<TopCustomerRow>();

    return {
      from,
      to,
      topCustomers: topCustomers.map((customer) => ({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        order_count: parseInt(customer.order_count),
        total_spent: parseFloat(customer.total_spent) || 0,
      })),
    };
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

  private validateChartType(type: string): void {
    const validTypes = [
      'sales_by_category',
      'sales_by_payment_method',
      'daily_sales',
    ];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid chart type. Supported types: ${validTypes.join(', ')}`,
      );
    }
  }
}
