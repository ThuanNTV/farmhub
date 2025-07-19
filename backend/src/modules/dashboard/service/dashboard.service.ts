import { Injectable } from '@nestjs/common';
import { CustomersService } from 'src/modules/customers/service/customers.service';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { ProductsService } from 'src/modules/products/service';

@Injectable()
export class DashboardService {
  constructor(
    private ordersService: OrdersService,
    private customersService: CustomersService,
    private productsService: ProductsService,
  ) {}

  async getOverview(storeId: string) {
    const [orders, customers, bestSelling] = await Promise.all([
      this.ordersService.findAllOrder(storeId),
      this.customersService.findAll(storeId),
      this.getBestSellingProducts(storeId),
    ]);
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      bestSellingProducts: bestSelling,
    };
  }

  async getRevenue(storeId: string) {
    const orders = await this.ordersService.findAllOrder(storeId);
    const byDay = orders.reduce(
      (acc, o) => {
        const date = o.createdAt.toISOString().slice(0, 10) || 'unknown';
        acc[date] = (acc[date] || 0) + (o.totalAmount || 0);
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      total: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      byDay: Object.entries(byDay).map(([date, revenue]) => ({
        date,
        revenue,
      })),
    };
  }

  async getOrders(storeId: string) {
    const orders = await this.ordersService.findAllOrder(storeId);
    const byStatus = orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      total: orders.length,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({
        status,
        count,
      })),
    };
  }

  async getCustomers(storeId: string) {
    const customers = await this.customersService.findAll(storeId);
    // Fetch all orders for the store
    const orders = await this.ordersService.findAllOrder(storeId);
    // Map customer_id to total spending
    const spendingMap: Record<string, number> = {};
    for (const order of orders) {
      if (order.customerId && !order.isDeleted) {
        spendingMap[order.customerId] =
          (spendingMap[order.customerId] || 0) + (order.totalAmount || 0);
      }
    }
    // Attach totalSpent to each customer
    const customersWithSpending = customers.map((c) => ({
      ...c,
      totalSpent: spendingMap[c.customer_id] || 0,
    }));
    // Sort by totalSpent descending
    customersWithSpending.sort((a, b) => b.totalSpent - a.totalSpent);
    const topCustomers = customersWithSpending.slice(0, 5);
    const now = Date.now();
    const newCustomers = customers.filter(
      (c) => now - new Date(c.created_at).getTime() < 7 * 24 * 60 * 60 * 1000,
    ).length;
    return {
      total: customers.length,
      newCustomers,
      topCustomers,
    };
  }

  async getBestSellingProducts(storeId: string) {
    const orders = await this.ordersService.findAllOrder(storeId);
    const productCount: Record<string, number> = {};
    for (const o of orders) {
      for (const item of o.orderItems) {
        productCount[item.productId] =
          (productCount[item.productId] || 0) + (item.quantity || 0);
      }
    }
    const products = await this.productsService.findAll(storeId);
    const best = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const p = products.find((p) => p.product_id === productId);
        return { name: p?.name ?? productId, quantity };
      });
    return best;
  }
}
