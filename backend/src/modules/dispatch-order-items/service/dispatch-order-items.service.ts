import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { CreateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/create-dispatchOrderItem.dto';
import { UpdateDispatchOrderItemDto } from 'src/modules/dispatch-order-items/dto/update-dispatchOrderItem.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DispatchOrderItem } from 'src/entities/tenant/dispatch_order_item.entity';
import { DispatchOrder } from 'src/entities/tenant/dispatch_order.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';

@Injectable()
export class DispatchOrderItemsService extends TenantBaseService<DispatchOrderItem> {
  protected readonly logger = new Logger(DispatchOrderItemsService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, DispatchOrderItem);
    this.primaryKey = 'dispatch_order_item_id';
  }

  async create(
    storeId: string,
    dto: CreateDispatchOrderItemDto,
  ): Promise<DispatchOrderItem> {
    try {
      this.logger.log(`Creating dispatch order item for store: ${storeId}`);

      // Validate input data
      await this.validateCreateInput(storeId, dto);

      // Check for duplicate item in same dispatch order
      await this.checkDuplicateItem(
        storeId,
        dto.dispatchOrderId,
        dto.productId,
      );

      // Validate business rules
      await this.validateBusinessRules(storeId, dto);

      // Calculate total price if not provided
      const calculatedDto = {
        ...dto,
        totalPrice:
          dto.totalPrice ?? (dto.quantity * Number(dto.unitPrice)).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entityData = DtoMapper.mapToEntity<DispatchOrderItem>(
        calculatedDto as unknown as Record<string, unknown>,
      );

      const result = await super.create(storeId, entityData);

      this.logger.log(`Dispatch order item created successfully: ${result.id}`);
      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create dispatch order item: ${errMsg}`);
      throw error;
    }
  }

  async findById(
    storeId: string,
    id: string,
  ): Promise<DispatchOrderItem | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<DispatchOrderItem> {
    const item = await this.findById(storeId, id);
    if (!item) {
      throw new NotFoundException(
        `DispatchOrderItem with ID "${id}" not found`,
      );
    }
    return item;
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { is_deleted: false },
      relations: [
        'dispatch_order',
        'product',
        'created_by_user',
        'updated_by_user',
      ],
    });
  }

  async update(storeId: string, id: string, dto: UpdateDispatchOrderItemDto) {
    const item = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    const entityData = DtoMapper.mapToEntity<DispatchOrderItem>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(item, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const item = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Soft delete
    item.is_deleted = true;
    await repo.save(item);

    return {
      message: `✅ DispatchOrderItem với ID "${id}" đã được xóa`,
      data: null,
    };
  }

  async findByDispatchOrderId(storeId: string, dispatchOrderId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: {
        dispatch_order_id: dispatchOrderId,
        is_deleted: false,
      },
      relations: ['product', 'created_by_user', 'updated_by_user'],
    });
  }

  // Private validation methods
  private async validateCreateInput(
    storeId: string,
    dto: CreateDispatchOrderItemDto,
  ): Promise<void> {
    // Validate required fields
    if (!dto.dispatchOrderId) {
      throw new BadRequestException('Dispatch Order ID is required');
    }
    if (!dto.productId) {
      throw new BadRequestException('Product ID is required');
    }
    if (!dto.quantity || dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    if (!dto.unitPrice || Number(dto.unitPrice) <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    // Validate foreign key existence
    await this.validateDispatchOrderExists(storeId, dto.dispatchOrderId);
    await this.validateProductExists(storeId, dto.productId);
  }

  private async checkDuplicateItem(
    storeId: string,
    dispatchOrderId: string,
    productId: string,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);
    const existing = await repo.findOne({
      where: {
        dispatch_order_id: dispatchOrderId,
        product_id: productId,
        is_deleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Product already exists in this dispatch order`,
      );
    }
  }

  private async validateBusinessRules(
    storeId: string,
    dto: CreateDispatchOrderItemDto,
  ): Promise<void> {
    // Validate quantity limits
    if (dto.quantity > 10000) {
      throw new BadRequestException('Quantity cannot exceed 10,000 units');
    }

    // Validate price limits
    if (Number(dto.unitPrice) > 1000000000) {
      throw new BadRequestException('Unit price cannot exceed 1,000,000,000');
    }

    // Calculate and validate total price
    const calculatedTotal = dto.quantity * Number(dto.unitPrice);
    if (
      dto.totalPrice &&
      Math.abs(Number(dto.totalPrice) - calculatedTotal) > 0.01
    ) {
      throw new BadRequestException(
        'Total price does not match quantity × unit price',
      );
    }
  }

  private async validateDispatchOrderExists(
    storeId: string,
    dispatchOrderId: string,
  ): Promise<void> {
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const dispatchOrderRepo = dataSource.getRepository(DispatchOrder);

    const dispatchOrder = await dispatchOrderRepo.findOne({
      where: { id: dispatchOrderId, is_deleted: false },
    });

    if (!dispatchOrder) {
      throw new NotFoundException(
        `Dispatch Order with ID ${dispatchOrderId} not found`,
      );
    }
  }

  private async validateProductExists(
    storeId: string,
    productId: string,
  ): Promise<void> {
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: { product_id: productId, is_deleted: false, is_active: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${productId} not found or inactive`,
      );
    }
  }
}
