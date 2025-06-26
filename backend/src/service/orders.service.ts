import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/dtoOders/create-order.dto';
import { TenantBaseService } from 'src/common/helpers/tenant-base.service';
import { Order, OrderStatus } from 'src/entities/tenant/order.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { UpdateOrderDto } from 'src/dto/dtoOders/update-order.dto';
import { DeepPartial } from 'typeorm';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { plainToInstance } from 'class-transformer';
import { ProductsService } from 'src/service/products.service';

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
  ) {
    super(tenantDS, Order);
    this.primaryKey = 'orderId';
  }

  async createOrder(storeId: string, dto: CreateOrderDto) {
    const repo = await this.getRepo(storeId);
    const { orderItems, ...orderData } = dto;

    if (!orderItems?.length) {
      throw new BadRequestException('❌ Đơn hàng phải có ít nhất một sản phẩm');
    }

    // Validate chi tiết sản phẩm
    for (const [index, item] of orderItems.entries()) {
      const itemLabel = item.productName || `#${index + 1}`;
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
        productUnit: item.productUnit,
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

    const order = repo.create({
      ...orderData,
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
      where: {
        orderId,
        isDeleted: false,
      },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException(
        `❌ Không tìm thấy Đơn hàng với ID "${orderId}"`,
      );
    }

    return order;
  }

  async update(storeId: string, orderId: string, dto: UpdateOrderDto) {
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

      for (const itemDto of dto.orderItems) {
        const existing = existingItems.find(
          (item) => item.productId === itemDto.productId,
        );
        const product = await this.productsService.findById(
          storeId,
          itemDto.productId,
        );
        if (!product) {
          throw new InternalServerErrorException(
            `❌ Sản phẩm ${itemDto.productId} không tồn tại!`,
          );
        }
        if (existing) {
          // Update existing item
          existing.quantity = itemDto.quantity;
          existing.unitPrice = itemDto.unitPrice;
          existing.productName = itemDto.productName;
          existing.productUnit = itemDto.productUnit;
          existing.totalPrice = existing.quantity * existing.unitPrice;
          existing.isDeleted = false;
          existing.updatedAt = new Date();
          finalItems.push(existing);
        } else {
          // Create new item - KEY CHANGE: Don't set the order relation
          const newItem = plainToInstance(OrderItem, {
            ...itemDto,
            orderId: order.orderId, // Only set the foreign key
            totalPrice: itemDto.quantity * itemDto.unitPrice,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // DO NOT set newItem.order = order;
          finalItems.push(newItem);
        }

        processedProductIds.add(itemDto.productId);
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
        where: { orderId: savedOrder.orderId },
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
}
