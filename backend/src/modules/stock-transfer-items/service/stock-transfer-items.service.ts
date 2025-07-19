import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { StockTransferItem } from 'src/entities/tenant/stock_transfer_item.entity';
import { StockTransfer } from 'src/entities/tenant/stock_transfer.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { CreateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/create-stockTransferItem.dto';
import { UpdateStockTransferItemDto } from 'src/modules/stock-transfer-items/dto/update-stockTransferItem.dto';

@Injectable()
export class StockTransferItemsService extends TenantBaseService<StockTransferItem> {
  protected readonly logger = new Logger(StockTransferItemsService.name);
  protected primaryKey = 'stock_transfer_item_id';

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, StockTransferItem);
  }

  async create(
    storeId: string,
    createStockTransferItemDto: CreateStockTransferItemDto,
  ): Promise<StockTransferItem> {
    try {
      this.logger.log(`Creating stock transfer item for store: ${storeId}`);

      // Validate input data
      await this.validateCreateInput(storeId, createStockTransferItemDto);

      // Check for duplicate item in same stock transfer
      await this.checkDuplicateItem(
        storeId,
        createStockTransferItemDto.stockTransferId as string,
        createStockTransferItemDto.productId as string,
      );

      // Validate business rules
      await this.validateBusinessRules(storeId, createStockTransferItemDto);

      // Validate stock availability
      await this.validateStockAvailability(storeId, createStockTransferItemDto);

      // Calculate total price if not provided
      const calculatedDto = {
        ...createStockTransferItemDto,
        totalPrice:
          createStockTransferItemDto.totalPrice ??
          (createStockTransferItemDto.quantity &&
          createStockTransferItemDto.unitPrice
            ? createStockTransferItemDto.quantity *
              createStockTransferItemDto.unitPrice
            : undefined),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = await this.getRepo(storeId);
      const result = await repo.save({ ...calculatedDto, storeId });

      this.logger.log(`Stock transfer item created successfully: ${result.id}`);
      return DtoMapper.mapToDto<StockTransferItem>({ ...result });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create stock transfer item: ${errMsg}`);
      throw error;
    }
  }

  async findAll(storeId: string): Promise<StockTransferItem[]> {
    const repo = await this.getRepo(storeId);
    const entities = await repo.find();
    return entities.map((entity) =>
      DtoMapper.mapToDto<StockTransferItem>({ ...entity }),
    );
  }

  async findOne(
    storeId: string,
    id: string,
  ): Promise<StockTransferItem | null> {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id } });
    return entity ? DtoMapper.mapToDto<StockTransferItem>({ ...entity }) : null;
  }

  async update(
    storeId: string,
    id: string,
    updateStockTransferItemDto: UpdateStockTransferItemDto,
  ) {
    const entityData = DtoMapper.mapToEntity<StockTransferItem>(
      updateStockTransferItemDto as Record<string, unknown>,
    );
    await super.updateById(
      storeId,
      id,
      entityData as Partial<StockTransferItem>,
    );
    // Fetch the updated entity to return as DTO
    const repo = await this.getRepo(storeId);
    const updatedEntity = await repo.findOne({ where: { id } });
    return updatedEntity
      ? DtoMapper.mapToDto<StockTransferItem>({ ...updatedEntity })
      : null;
  }

  async removeStockTransferItem(id: string, storeId: string) {
    try {
      const result = await this.deleteById(storeId, id);
      if (result.affected === 0) {
        throw new NotFoundException('Stock transfer item not found');
      }
      return { message: 'Stock transfer item deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to delete stock transfer item');
    }
  }

  // Private validation methods
  private async validateCreateInput(
    storeId: string,
    dto: CreateStockTransferItemDto,
  ): Promise<void> {
    // Validate required fields
    if (!dto.stockTransferId) {
      throw new BadRequestException('StockTransferId is required');
    }
    if (!dto.productId) {
      throw new BadRequestException('ProductId is required');
    }
    if (!dto.quantity || dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }
    if (!dto.unitPrice || dto.unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    // Validate foreign key existence
    await this.validateStockTransferExists(storeId, dto.stockTransferId);
    await this.validateProductExists(storeId, dto.productId);
  }

  private async checkDuplicateItem(
    storeId: string,
    stockTransferId: string,
    productId: string,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);
    const existing = await repo.findOne({
      where: {
        stockTransferId,
        productId,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Product already exists in this stock transfer`,
      );
    }
  }

  private validateBusinessRules(
    storeId: string,
    dto: CreateStockTransferItemDto,
  ): void {
    // Validate quantity limits
    if (dto.quantity !== undefined && dto.quantity > 50000) {
      throw new BadRequestException('Quantity cannot exceed 50,000 units');
    }

    // Validate price limits
    if (dto.unitPrice !== undefined && dto.unitPrice > 1000000000) {
      throw new BadRequestException('Unit price cannot exceed 1,000,000,000');
    }

    // Calculate and validate total price
    if (
      dto.totalPrice &&
      dto.quantity !== undefined &&
      dto.unitPrice !== undefined
    ) {
      const calculatedTotal = dto.quantity * dto.unitPrice;
      if (Math.abs(dto.totalPrice - calculatedTotal) > 0.01) {
        throw new BadRequestException(
          'Total price does not match quantity × unit price',
        );
      }
    }
  }

  private async validateStockAvailability(
    storeId: string,
    dto: CreateStockTransferItemDto,
  ): Promise<void> {
    // This would typically check current stock levels
    // For now, we'll do basic validation
    if (dto.quantity !== undefined && dto.quantity > 1000) {
      this.logger.warn(
        `Large quantity transfer requested: ${dto.quantity} units of product ${dto.productId}`,
      );
    }
  }

  private async validateStockTransferExists(
    storeId: string,
    stockTransferId: string,
  ): Promise<void> {
    const dataSource =
      await this.tenantDataSourceService.getTenantDataSource(storeId);
    const stockTransferRepo = dataSource.getRepository(StockTransfer);

    const stockTransfer = await stockTransferRepo.findOne({
      where: { id: stockTransferId, isDeleted: false },
    });

    if (!stockTransfer) {
      throw new NotFoundException(
        `Stock Transfer with ID ${stockTransferId} not found`,
      );
    }

    // Check if stock transfer is in a valid state for adding items
    if (
      stockTransfer.status === 'COMPLETED' ||
      stockTransfer.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        `Cannot add items to ${stockTransfer.status.toLowerCase()} stock transfer`,
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
