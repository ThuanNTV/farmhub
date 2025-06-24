import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/dtoOders/create-order.dto';
import { TenantBaseService } from 'src/common/helpers/tenant-base.service';
import { Order } from 'src/entities/tenant/order.entity';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

@Injectable()
export class OrdersService extends TenantBaseService<Order> {
  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Order);
  }

  async createOrder(storeId: string, dto: CreateOrderDto) {
    const repo = await this.getRepo(storeId);

    const { orderItems, ...orderData } = dto;

    if (!orderItems || orderItems.length === 0) {
      throw new BadRequestException('❌ Đơn hàng phải có ít nhất một sản phẩm');
    }

    // Validate order items
    for (const item of orderItems) {
      if (!item.productId) {
        throw new BadRequestException(
          `❌ Sản phẩm "${item.productName}" thiếu productId`,
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${item.productName}" phải có số lượng > 0`,
        );
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new BadRequestException(
          `❌ Sản phẩm "${item.productName}" phải có giá > 0`,
        );
      }
    }

    // Create order with items - make sure NOT to set orderId manually
    const order = repo.create({
      ...orderData,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productUnit: item.productUnit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    } as unknown as import('typeorm').DeepPartial<Order>);

    try {
      // Save with cascade - this should save order first, then items
      const savedOrder = await repo.save(order);

      // Return the saved order with its items
      return await repo.findOne({
        where: { orderId: savedOrder.orderId },
        relations: ['orderItems'],
      });
    } catch (error) {
      this.logger.error('❌ Error saving order:', error);

      if (error instanceof Error) {
        if (error.message.includes('violates foreign key constraint')) {
          if (error.message.includes('order_id')) {
            throw new BadRequestException(
              '❌ Lỗi tạo đơn hàng - không thể liên kết sản phẩm',
            );
          }
          throw new BadRequestException(
            '❌ Một hoặc nhiều sản phẩm không tồn tại',
          );
        }
        if (error.message.includes('violates not-null constraint')) {
          throw new BadRequestException(
            '❌ Thiếu thông tin bắt buộc cho sản phẩm',
          );
        }
      }

      throw new InternalServerErrorException(
        'Không thể tạo đơn hàng. Vui lòng thử lại.',
      );
    }
  }

  async findAllOrder(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({ where: { isDeleted: false } });
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }
  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
