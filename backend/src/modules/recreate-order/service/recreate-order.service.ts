import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Order, OrderStatus } from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';

/**
 * Service for recreating orders from existing orders
 */
@Injectable()
export class RecreateOrderService extends TenantBaseService<Order> {
  protected readonly logger = new Logger(RecreateOrderService.name);
  protected primaryKey = 'id';
  protected tenantDS: TenantDataSourceService;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Order);
    this.tenantDS = tenantDS;
  }

  /**
   * Recreate order from existing order
   * @param storeId Store ID
   * @param originalOrderId Original order ID to recreate
   * @param userId User ID creating the new order
   * @returns Recreated order
   */
  async recreateOrder(
    storeId: string,
    originalOrderId: string,
    userId: string,
  ): Promise<Order> {
    try {
      this.logger.log(
        `Recreating order from original order: ${originalOrderId} for store: ${storeId}`,
      );
      const dataSource = await this.tenantDS.getTenantDataSource(storeId);
      const orderRepo = dataSource.getRepository(Order);
      const orderItemRepo = dataSource.getRepository(OrderItem);

      // Tìm đơn hàng gốc
      const originalOrder = await orderRepo.findOne({
        where: { orderId: originalOrderId, isDeleted: false },
        relations: ['orderItems'],
      });

      if (!originalOrder) {
        throw new BadRequestException(
          `Original order with ID ${originalOrderId} not found`,
        );
      }

      // Lấy danh sách sản phẩm của đơn hàng gốc
      const originalOrderItems = await orderItemRepo.find({
        where: { orderId: originalOrderId, isDeleted: false },
      });

      return await dataSource.transaction(async (manager) => {
        // Tạo đơn hàng mới dựa trên đơn hàng gốc
        const newOrder = manager.getRepository(Order).create({
          customerId: originalOrder.customerId,
          totalAmount: originalOrder.totalAmount,
          status: OrderStatus.PENDING,
          note: `Recreated from order ${originalOrderId}`,
          processedByUserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        });

        const savedOrder = await manager.getRepository(Order).save(newOrder);

        // Tạo các sản phẩm cho đơn hàng mới
        for (const originalItem of originalOrderItems) {
          const newOrderItem = manager.getRepository(OrderItem).create({
            orderId: savedOrder.orderId,
            productId: originalItem.productId,
            productName: originalItem.productName,
            productUnitId: originalItem.productUnitId,
            quantity: originalItem.quantity,
            unitPrice: originalItem.unitPrice,
            totalPrice: originalItem.totalPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          });

          await manager.getRepository(OrderItem).save(newOrderItem);
        }

        this.logger.log(
          `Order recreated successfully: ${savedOrder.orderId} from ${originalOrderId}`,
        );

        return savedOrder;
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to recreate order: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get recreation history for an order
   * @param storeId Store ID
   * @param orderId Order ID
   * @returns List of recreated orders
   */
  async getRecreationHistory(
    storeId: string,
    orderId: string,
  ): Promise<Order[]> {
    try {
      this.logger.debug(
        `Getting recreation history for order ${orderId} in store ${storeId}`,
      );
      const dataSource = await this.tenantDS.getTenantDataSource(storeId);
      const orderRepo = dataSource.getRepository(Order);

      const recreatedOrders = await orderRepo.find({
        where: {
          note: `Recreated from order ${orderId}`,
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(
        `Found ${recreatedOrders.length} recreated orders for order ${orderId}`,
      );

      return recreatedOrders;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get recreation history: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
