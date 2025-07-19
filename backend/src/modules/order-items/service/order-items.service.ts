import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { Not } from 'typeorm';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';
import { Order } from 'src/entities/tenant/order.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { CreateOrderItemDto } from 'src/modules/order-items/dto/create-orderItem.dto';
import { OrderItemResponseDto } from 'src/modules/order-items/dto/orderItem-response.dto';
import { UpdateOrderItemDto } from 'src/modules/order-items/dto/update-orderItem.dto';

@Injectable()
export class OrderItemsService extends TenantBaseService<OrderItem> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, OrderItem);
    this.primaryKey = 'order_item_id';
  }

  async createOrderItem(
    storeId: string,
    createOrderItemDto: CreateOrderItemDto,
    userId: string,
  ): Promise<OrderItemResponseDto> {
    // Validate foreign keys
    await this.validateForeignKeys(storeId, createOrderItemDto);

    // Check unique constraint (order_id, product_id)
    const repo = await this.getRepo(storeId);
    const existingItem = await repo.findOne({
      where: {
        orderId: createOrderItemDto.orderId,
        productId: createOrderItemDto.productId,
        isDeleted: false,
      },
    });

    if (existingItem) {
      throw new ConflictException(
        'Order item with this order and product already exists',
      );
    }

    // Validate numeric fields
    this.validateNumericFields(createOrderItemDto);

    const entityData = DtoMapper.mapToEntity<OrderItem>(
      createOrderItemDto as unknown as Record<string, unknown>,
    );

    const orderItem = repo.create({
      ...entityData,
      createdByUserId: userId,
      updatedByUserId: userId,
    });

    const saved: OrderItem = await repo.save(orderItem);
    return this.mapToResponseDto(saved);
  }

  async findAllOrderItems(storeId: string): Promise<OrderItemResponseDto[]> {
    const repo = await this.getRepo(storeId);
    const orderItems = await repo.find({
      where: { isDeleted: false },
      relations: ['order', 'product'],
      order: { createdAt: 'DESC' },
    });
    return orderItems.map((item) => this.mapToResponseDto(item));
  }

  async findOne(storeId: string, id: string): Promise<OrderItemResponseDto> {
    const repo = await this.getRepo(storeId);
    const orderItem = await repo.findOne({
      where: { orderItemId: id, isDeleted: false },
      relations: ['order', 'product'],
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    return this.mapToResponseDto(orderItem);
  }

  async update(
    storeId: string,
    id: string,
    updateOrderItemDto: UpdateOrderItemDto,
    userId: string,
  ): Promise<OrderItemResponseDto> {
    const repo = await this.getRepo(storeId);
    const orderItem = await repo.findOne({
      where: { orderItemId: id, isDeleted: false },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    // Validate foreign keys if provided
    if (updateOrderItemDto.orderId || updateOrderItemDto.productId) {
      await this.validateForeignKeys(storeId, {
        orderId: updateOrderItemDto.orderId ?? orderItem.orderId,
        productId: updateOrderItemDto.productId ?? orderItem.productId,
      });
    }

    // Check unique constraint if order_id or product_id is being updated
    if (updateOrderItemDto.orderId || updateOrderItemDto.productId) {
      const newOrderId = updateOrderItemDto.orderId ?? orderItem.orderId;
      const newProductId = updateOrderItemDto.productId ?? orderItem.productId;

      const existingItem = await repo.findOne({
        where: {
          orderId: newOrderId,
          productId: newProductId,
          orderItemId: Not(id),
          isDeleted: false,
        },
      });

      if (existingItem) {
        throw new ConflictException(
          'Order item with this order and product already exists',
        );
      }
    }

    // Validate numeric fields if provided
    if (
      updateOrderItemDto.unitPrice ||
      updateOrderItemDto.totalPrice ||
      updateOrderItemDto.quantity
    ) {
      this.validateNumericFields({
        unitPrice: updateOrderItemDto.unitPrice ?? orderItem.unitPrice,
        totalPrice: updateOrderItemDto.totalPrice ?? orderItem.totalPrice,
        quantity: updateOrderItemDto.quantity ?? orderItem.quantity,
      });
    }

    // Update fields individually to ensure proper type conversion
    if (updateOrderItemDto.orderId)
      orderItem.orderId = updateOrderItemDto.orderId;
    if (updateOrderItemDto.productId)
      orderItem.productId = updateOrderItemDto.productId;
    if (updateOrderItemDto.productName)
      orderItem.productName = updateOrderItemDto.productName;
    if (updateOrderItemDto.productUnitId)
      orderItem.productUnitId = updateOrderItemDto.productUnitId;
    if (updateOrderItemDto.quantity)
      orderItem.quantity = updateOrderItemDto.quantity;
    if (updateOrderItemDto.unitPrice)
      orderItem.unitPrice = updateOrderItemDto.unitPrice;
    if (updateOrderItemDto.totalPrice)
      orderItem.totalPrice = updateOrderItemDto.totalPrice;
    if (updateOrderItemDto.note) orderItem.note = updateOrderItemDto.note;

    orderItem.updatedByUserId = userId;

    const saved = await repo.save(orderItem);
    return this.mapToResponseDto(saved);
  }

  async remove(
    storeId: string,
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const repo = await this.getRepo(storeId);
    const orderItem = await repo.findOne({
      where: { orderItemId: id, isDeleted: false },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${id} not found`);
    }

    // Soft delete
    orderItem.isDeleted = true;
    orderItem.updatedByUserId = userId;
    await repo.save(orderItem);

    return { message: `Order item with ID ${id} has been soft deleted` };
  }

  async restore(
    storeId: string,
    id: string,
    userId: string,
  ): Promise<OrderItemResponseDto> {
    const repo = await this.getRepo(storeId);
    const orderItem = await repo.findOne({
      where: { orderItemId: id, isDeleted: true },
    });

    if (!orderItem) {
      throw new NotFoundException(
        `Order item with ID ${id} not found or not deleted`,
      );
    }

    // Restore
    orderItem.isDeleted = false;
    orderItem.updatedByUserId = userId;

    const saved = await repo.save(orderItem);
    return this.mapToResponseDto(saved);
  }

  async findByOrder(
    storeId: string,
    orderId: string,
  ): Promise<OrderItemResponseDto[]> {
    const repo = await this.getRepo(storeId);
    const orderItems = await repo.find({
      where: { orderId, isDeleted: false },
      relations: ['product'],
      order: { createdAt: 'ASC' },
    });
    return orderItems.map((item) => this.mapToResponseDto(item));
  }

  private async validateForeignKeys(
    storeId: string,
    dto: Partial<CreateOrderItemDto>,
  ): Promise<void> {
    const ds = await this.tenantDataSourceService.getTenantDataSource(storeId);
    const orderRepo = ds.getRepository(Order);
    const productRepo = ds.getRepository(Product);

    if (dto.orderId) {
      const order = await orderRepo.findOne({
        where: { orderId: dto.orderId, isDeleted: false },
      });
      if (!order) {
        throw new BadRequestException(`Order with ID ${dto.orderId} not found`);
      }
    }

    if (dto.productId) {
      const product = await productRepo.findOne({
        where: { product_id: dto.productId, is_deleted: false },
      });
      if (!product) {
        throw new BadRequestException(
          `Product with ID ${dto.productId} not found`,
        );
      }
    }
  }

  private validateNumericFields(dto: Partial<CreateOrderItemDto>): void {
    if (
      dto.unitPrice !== undefined &&
      (isNaN(dto.unitPrice) || dto.unitPrice < 0)
    ) {
      throw new BadRequestException('Unit price must be a positive number');
    }

    if (
      dto.totalPrice !== undefined &&
      (isNaN(dto.totalPrice) || dto.totalPrice < 0)
    ) {
      throw new BadRequestException('Total price must be a positive number');
    }

    if (
      dto.quantity !== undefined &&
      (isNaN(dto.quantity) || dto.quantity <= 0)
    ) {
      throw new BadRequestException('Quantity must be a positive number');
    }
  }

  private mapToResponseDto(orderItem: OrderItem): OrderItemResponseDto {
    return {
      orderItemId: orderItem.orderItemId,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      productName: orderItem.productName,
      productUnitId: orderItem.productUnitId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice,
      totalPrice: orderItem.totalPrice,
      note: orderItem.note,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
      createdByUserId: orderItem.createdByUserId,
      updatedByUserId: orderItem.updatedByUserId,
      isDeleted: orderItem.isDeleted,
    };
  }
}
