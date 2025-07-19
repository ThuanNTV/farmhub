/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DeepPartial } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Order } from 'src/entities/tenant/order.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { ProductsService } from 'src/modules/products/service/products.service';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';
import { PaymentTransactionService } from 'src/modules/payments/service';
import { AuditTransactionService } from 'src/modules/audit-logs/service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { CreateOrderAtomicDto } from 'src/modules/orders/dto/create-order-atomic.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { OrderStatus } from 'src/entities/tenant/order.entity';
import { OrderItemData } from 'src/common/types/common.types';

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
}

export function calculateTotalPaid(
  totalAmount: number,
  discountAmount: number,
  shippingFee: number,
): number {
  return totalAmount - discountAmount + shippingFee;
}
@Injectable()
export class OrdersService extends TenantBaseService<Order> {
  protected primaryKey!: string;
  constructor(
    tenantDS: TenantDataSourceService,
    private productsService: ProductsService,
    private inventoryService: InventoryTransfersService,
    private paymentTransactionService: PaymentTransactionService,
    private auditTransactionService: AuditTransactionService,
  ) {
    super(tenantDS, Order);
    this.primaryKey = 'orderId';
  }

  async createOrder(
    storeId: string,
    dto: CreateOrderDto & { orderItems?: Array<Partial<OrderItem>> },
  ) {
    const repo = await this.getRepo(storeId);
    const { orderItems, ...orderData } = dto;

    if (!orderItems?.length) {
      throw new BadRequestException('❌ Đơn hàng phải có ít nhất một sản phẩm');
    }

    // Validate chi tiết sản phẩm
    for (const [index, item] of orderItems.entries()) {
      const itemLabel = item.productName ?? `#${index + 1}`;
      if (!item.productId) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" thiếu productId`,
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" phải có số lượng > 0`,
        );
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" phải có giá > 0`,
        );
      }
    }

    const calculatedItems = orderItems.map((item) =>
      plainToInstance(OrderItem, {
        productId: item.productId,
        productName: item.productName,
        productUnitId: item.productUnitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: Number(item.unitPrice) * Number(item.quantity),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const totalAmount = calculateOrderTotal(calculatedItems);
    const totalPaid = calculateTotalPaid(
      totalAmount,
      orderData.discountAmount ?? 0,
      orderData.shippingFee ?? 0,
    );

    const entityData = DtoMapper.mapToEntity<Order>(
      orderData as unknown as Record<string, unknown>,
    );
    const order = repo.create({
      ...entityData,
      totalAmount,
      totalPaid,
      orderItems: calculatedItems,
    } as unknown as DeepPartial<Order>);

    try {
      const savedOrder = await repo.save(order);
      return await repo.findOne({
        where: { orderId: savedOrder.orderId },
        relations: ['orderItems'],
      });
    } catch (error) {
      this.logger.error('❌ Lỗi khi lưu đơn hàng:', error);

      const message = error instanceof Error ? error.message : '';
      if (message.includes('violates foreign key constraint')) {
        throw new BadRequestException(
          '❌ Một hoặc nhiều sản phẩm không tồn tại',
        );
      }
      if (message.includes('violates not-null constraint')) {
        throw new BadRequestException(
          '❌ Thiếu thông tin bắt buộc cho đơn hàng',
        );
      }

      throw new InternalServerErrorException(
        'Không thể tạo đơn hàng. Vui lòng thử lại sau.',
      );
    }
  }

  async findAllOrder(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { isDeleted: false },
      relations: ['orderItems'],
    });
  }

  async findOne(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const order = await repo.findOne({
      where: { orderId, isDeleted: false },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException(
        `❌ Không tìm thấy Đơn hàng với ID "${orderId}"`,
      );
    }

    return order;
  }

  async update(
    storeId: string,
    orderId: string,
    dto: UpdateOrderDto & { orderItems?: OrderItemData[] },
  ) {
    const repo = await this.getRepo(storeId);

    // Find the order
    const order = await repo.findOne({
      where: {
        orderId,
        orderCode: dto.orderCode,
        isDeleted: false,
        status: OrderStatus.PENDING,
      },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new InternalServerErrorException(
        `❌ Đơn hàng với orderCode "${dto.orderCode}" không tồn tại hoặc Không được chỉnh sửa`,
      );
    }

    // Update order properties (excluding orderItems)

    const { orderItems, ...orderData } = dto;
    const updated = repo.merge(order, orderData as DeepPartial<Order>);

    // Handle orderItems if provided
    if (dto.orderItems) {
      const existingItems = order.orderItems.filter((i) => !i.isDeleted);
      const finalItems: OrderItem[] = [];
      const processedProductIds = new Set<string>();

      for (const itemDto of dto.orderItems as Array<Partial<OrderItem>>) {
        const existing = existingItems.find(
          (item) => item.productId === itemDto.productId,
        );
        const product = await this.productsService.findById(
          storeId,
          itemDto.productId as string,
        );
        if (!product) {
          throw new InternalServerErrorException(
            `❌ Sản phẩm ${itemDto.productId} không tồn tại!`,
          );
        }
        if (existing) {
          // Update existing item
          existing.quantity = itemDto.quantity ?? existing.quantity;
          existing.unitPrice = itemDto.unitPrice ?? existing.unitPrice;
          existing.productName = itemDto.productName ?? existing.productName;
          existing.productUnitId =
            itemDto.productUnitId ?? existing.productUnitId;
          existing.totalPrice =
            (existing.quantity || 0) * (existing.unitPrice || 0);
          existing.isDeleted = false;
          existing.updatedAt = new Date();
          finalItems.push(existing);
        } else {
          // Create new item - KEY CHANGE: Don't set the order relation
          const newItem = plainToInstance(OrderItem, {
            ...itemDto,
            orderId: order.orderId, // Only set the foreign key
            totalPrice: (itemDto.quantity ?? 0) * (itemDto.unitPrice ?? 0),
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // DO NOT set newItem.order = order;
          finalItems.push(newItem);
        }

        if (itemDto.productId) {
          processedProductIds.add(itemDto.productId);
        }
      }

      // Mark remaining items as deleted
      for (const remaining of existingItems) {
        if (!processedProductIds.has(remaining.productId)) {
          remaining.isDeleted = true;
          remaining.updatedAt = new Date();
          finalItems.push(remaining);
        }
      }

      // Set the final items array
      updated.orderItems = finalItems;
    }

    try {
      // Save and return
      const savedOrder = await repo.save(updated);

      // Return fresh data to ensure relations are properly loaded
      return await repo.findOne({
        where: { orderId: savedOrder.orderId, isDeleted: false },
        relations: ['orderItems'],
      });
    } catch (error) {
      this.logger.error('❌ Error updating order:', error);
      throw new InternalServerErrorException(
        'Không thể cập nhật đơn hàng. Vui lòng thử lại.',
      );
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }

  async remove(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, orderId);

    entity.isDeleted = true;
    await repo.save(entity);
    return {
      message: 'Xóa đơn hàng thành công',
      data: null,
    };
  }

  async restore(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({
      where: { orderId, isDeleted: true },
      relations: ['orderItems'],
    });
    if (!entity) {
      throw new InternalServerErrorException(
        'Đơn hàng không tồn tại hoặc chưa bị xóa mềm',
      );
    }
    entity.isDeleted = false;
    await repo.save(entity);
    return {
      message: 'Khôi phục đơn hàng thành công',
      data: entity,
    };
  }

  async confirmOrder(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const order = await this.findOne(storeId, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể xác nhận đơn hàng ở trạng thái PENDING',
      );
    }

    order.status = OrderStatus.CONFIRMED;
    order.updatedAt = new Date();
    await repo.save(order);

    return {
      message: 'Xác nhận đơn hàng thành công',
      data: order,
    };
  }

  async shipOrder(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const order = await this.findOne(storeId, orderId);

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Chỉ có thể giao hàng đơn hàng đã được xác nhận',
      );
    }

    order.status = OrderStatus.SHIPPED;
    order.updatedAt = new Date();
    await repo.save(order);

    return {
      message: 'Giao hàng thành công',
      data: order,
    };
  }

  async completeOrder(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const order = await this.findOne(storeId, orderId);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        'Chỉ có thể hoàn thành đơn hàng đã được giao',
      );
    }

    order.status = OrderStatus.DELIVERED;
    order.updatedAt = new Date();
    await repo.save(order);

    return {
      message: 'Hoàn thành đơn hàng thành công',
      data: order,
    };
  }

  async cancelOrder(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    const order = await this.findOne(storeId, orderId);

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Không thể hủy đơn hàng đã hoàn thành');
    }

    order.status = OrderStatus.CANCELLED;
    order.updatedAt = new Date();
    await repo.save(order);

    return {
      message: 'Hủy đơn hàng thành công',
      data: order,
    };
  }

  async findByStatus(storeId: string, status: OrderStatus) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: {
        status,
        isDeleted: false,
      },
      relations: ['orderItems'],
    });
  }

  async findByCustomer(storeId: string, customerId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { customerId, isDeleted: false },
      relations: ['orderItems'],
    });
  }

  async recreateOrder(storeId: string, orderId: string) {
    const repo = await this.getRepo(storeId);
    // Fetch the original order with items
    const original = await repo.findOne({
      where: { orderId, isDeleted: false },
      relations: ['orderItems'],
    });
    if (!original) {
      throw new NotFoundException(
        `Không tìm thấy đơn hàng gốc với ID "${orderId}"`,
      );
    }
    // Generate new order_code (append -COPY + timestamp)
    const newOrderCode = `${original.orderCode}-COPY-${Date.now()}`;
    // Prepare new order data (omit PKs, timestamps, unique fields)
    const {
      orderId: oldOrderId,
      createdAt,
      updatedAt,
      invoiceNumber,
      orderItems,
      ...rest
    } = original;
    const newOrder = repo.create({
      ...rest,
      orderCode: newOrderCode,
      status: OrderStatus.PENDING,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // order_items will be set below
    });
    // Clone order items
    if (Array.isArray(orderItems)) {
      newOrder.orderItems = orderItems.map((item) => {
        const { orderItemId, createdAt, updatedAt, ...itemRest } = item;
        return repo.manager.create('OrderItem', {
          ...itemRest,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }
    // Save new order and items
    const saved = await repo.save(newOrder);
    return await repo.findOne({
      where: { orderId: saved.orderId, isDeleted: false },
      relations: ['orderItems'],
    });
  }

  /**
   * Create order with atomic transaction including:
   * 1. Validate and decrease stock
   * 2. Create order and order items
   * 3. Create payment record
   * 4. Create audit logs
   *
   * @param storeId Store ID
   * @param dto Order creation data
   * @param userId User ID who creates the order
   * @param paymentMethodId Payment method ID
   * @returns Created order with all related data
   */
  async createOrderAtomic(
    storeId: string,
    dto:
      | (CreateOrderDto & { orderItems?: Array<Partial<OrderItem>> })
      | CreateOrderAtomicDto,
    userId: string,
    paymentMethodId: string,
  ): Promise<Order> {
    const { orderItems, ...orderData } = dto;

    // Validate input
    if (!orderItems?.length) {
      throw new BadRequestException('❌ Đơn hàng phải có ít nhất một sản phẩm');
    }

    if (!userId) {
      throw new BadRequestException('❌ User ID không được để trống');
    }

    if (!paymentMethodId) {
      throw new BadRequestException('❌ Payment method ID không được để trống');
    }

    // Validate order items
    for (const [index, item] of orderItems.entries()) {
      const itemLabel = (item as any).productName ?? `#${index + 1}`;
      if (!(item as any).productId) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" thiếu productId`,
        );
      }
      if (!(item as any).quantity || (item as any).quantity <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" phải có số lượng > 0`,
        );
      }
      if (!(item as any).unitPrice || (item as any).unitPrice <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${itemLabel}" phải có giá > 0`,
        );
      }
    }

    // Get tenant data source
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);

    // Start transaction
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      // Step 1: Validate stock availability (outside transaction for better performance)
      // Giả sử orderItems: Partial<OrderItem>[]
      const stockItems = (orderItems as Partial<OrderItem>[]).map((item) => ({
        productId: item.productId as string,
        quantity: item.quantity as number,
      }));

      await this.inventoryService.validateStockAvailability(
        storeId,
        stockItems,
      );

      // Step 2: Decrease stock (with pessimistic locking)
      await this.inventoryService.decreaseStock(storeId, stockItems, manager);

      // Step 3: Create order items
      const calculatedItems = (orderItems as Partial<OrderItem>[]).map((item) =>
        plainToInstance(OrderItem, {
          productId: item.productId as string,
          productName: item.productName as string,
          productUnitId: item.productUnitId as string,
          quantity: item.quantity as number,
          unitPrice: item.unitPrice as number,
          totalPrice: Number(item.unitPrice) * Number(item.quantity),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const totalAmount = calculateOrderTotal(calculatedItems);
      const totalPaid = calculateTotalPaid(
        totalAmount,
        orderData.discountAmount ?? 0,
        orderData.shippingFee ?? 0,
      );

      // Step 4: Create order
      const entityData = DtoMapper.mapToEntity<Order>(
        orderData as unknown as Record<string, unknown>,
      );

      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const order = orderRepo.create({
        ...entityData,
        totalAmount,
        totalPaid,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      } as unknown as DeepPartial<Order>);

      const savedOrder = await orderRepo.save(order);

      // Step 5: Create order items
      const orderItemsWithOrderId = calculatedItems.map((item) => ({
        ...item,
        orderId: savedOrder.orderId,
      }));

      await orderItemRepo.save(orderItemsWithOrderId);

      // Step 6: Process payment
      const paymentResult = await this.paymentTransactionService.processPayment(
        totalPaid,
        paymentMethodId,
      );

      if (!paymentResult.success) {
        throw new BadRequestException(
          `❌ Thanh toán thất bại: ${paymentResult.error}`,
        );
      }

      // Step 7: Create payment record
      const payment = await this.paymentTransactionService.createPayment(
        savedOrder.orderId,
        totalPaid,
        paymentMethodId,
        userId,
        manager,
      );

      // Step 8: Create audit logs
      await this.auditTransactionService.logOrderCreation(
        userId,
        savedOrder.orderId,
        {
          orderCode: savedOrder.orderCode,
          totalAmount: savedOrder.totalAmount,
          totalPaid: savedOrder.totalPaid,
          itemCount: orderItems.length,
        },
        manager,
      );

      // Log stock updates for each product
      for (const item of orderItems) {
        await this.auditTransactionService.logStockUpdate(
          userId,
          (item as any).productId,
          -(item as any).quantity!,
          `Order creation: ${savedOrder.orderCode}`,
          manager,
        );
      }

      // Log payment
      await this.auditTransactionService.logPayment(
        userId,
        payment.id,
        {
          amount: payment.amount,
          paymentMethodId: payment.payment_method_id,
          orderId: payment.order_id,
        },
        manager,
      );

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return complete order with relations
      const completeOrder = await orderRepo.findOne({
        where: { orderId: savedOrder.orderId },
        relations: ['orderItems'],
      });

      if (!completeOrder) {
        throw new InternalServerErrorException(
          '❌ Không thể tìm thấy đơn hàng sau khi tạo',
        );
      }

      this.logger.log(
        `✅ Đơn hàng ${savedOrder.orderCode} đã được tạo thành công với transaction`,
      );

      return completeOrder;
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();

      this.logger.error('❌ Lỗi trong quá trình tạo đơn hàng atomic:', error);

      // Re-throw the error with appropriate message
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes('violates foreign key constraint')) {
          throw new BadRequestException(
            '❌ Một hoặc nhiều sản phẩm không tồn tại',
          );
        }
        if (error.message.includes('violates not-null constraint')) {
          throw new BadRequestException(
            '❌ Thiếu thông tin bắt buộc cho đơn hàng',
          );
        }
      }

      throw new InternalServerErrorException(
        '❌ Không thể tạo đơn hàng. Vui lòng thử lại sau.',
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
