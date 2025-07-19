import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { StockTransfer } from 'src/entities/tenant/stock_transfer.entity';
import { StockTransferItem } from 'src/entities/tenant/stock_transfer_item.entity';
import { CreateStockTransferDto } from 'src/modules/stock-transfer/dto/create-stockTransfer.dto';
import { UpdateStockTransferDto } from 'src/modules/stock-transfer/dto/update-stockTransfer.dto';

@Injectable()
export class StockTransferService extends TenantBaseService<StockTransfer> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, StockTransfer);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateStockTransferDto,
  ): Promise<StockTransfer> {
    const repo = await this.getRepo(storeId);
    const itemRepo = repo.manager.getRepository(StockTransferItem);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    // Check if transfer code already exists
    const existingTransfer = await this.findByTransferCode(
      storeId,
      dto.transferCode,
    );
    if (existingTransfer) {
      throw new InternalServerErrorException(
        `❌ Phiếu chuyển kho với mã "${dto.transferCode}" đã tồn tại`,
      );
    }

    // Create stock transfer
    const transferData = {
      storeId,
      transferCode: dto.transferCode,
      fromStoreId: dto.fromStoreId,
      toStoreId: dto.toStoreId,
      transferDate: new Date(dto.transferDate),
      expectedDeliveryDate: dto.expectedDeliveryDate
        ? new Date(dto.expectedDeliveryDate)
        : undefined,
      notes: dto.notes,
      totalItems: dto.items.length,
      totalQuantity: dto.items.reduce((sum, item) => sum + item.quantity, 0),
      createdByUserId: dto.createdByUserId,
    };

    const stockTransfer = repo.create(transferData);
    const savedTransfer = await repo.save(stockTransfer);

    // Create stock transfer items
    const transferItems = dto.items.map((item) => ({
      storeId,
      stockTransferId: savedTransfer.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice ? item.quantity * item.unitPrice : undefined,
      notes: item.notes,
    }));

    await itemRepo.save(transferItems);

    return await this.findOne(storeId, savedTransfer.id);
  }

  async findById(storeId: string, id: string): Promise<StockTransfer | null> {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({
      where: { id, storeId, isDeleted: false },
      relations: [
        'fromStore',
        'toStore',
        'createdByUser',
        'updatedByUser',
        'approvedByUser',
      ],
    });
  }

  async findOne(storeId: string, id: string): Promise<StockTransfer> {
    const transfer = await this.findById(storeId, id);
    if (!transfer) {
      throw new NotFoundException(
        `❌ Không tìm thấy phiếu chuyển kho với ID "${id}"`,
      );
    }
    return transfer;
  }

  async findByTransferCode(
    storeId: string,
    transferCode: string,
  ): Promise<StockTransfer | null> {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({
      where: { transferCode, storeId, isDeleted: false },
    });
  }

  async findAll(storeId: string): Promise<StockTransfer[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, isDeleted: false },
      relations: ['fromStore', 'toStore', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(
    storeId: string,
    status: string,
  ): Promise<StockTransfer[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, status, isDeleted: false },
      relations: ['fromStore', 'toStore', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateStockTransferDto,
  ): Promise<StockTransfer> {
    const transfer = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    // Check if transfer code already exists (if being updated)
    if (dto.transferCode && dto.transferCode !== transfer.transferCode) {
      const existingTransfer = await this.findByTransferCode(
        storeId,
        dto.transferCode,
      );
      if (existingTransfer) {
        throw new InternalServerErrorException(
          `❌ Phiếu chuyển kho với mã "${dto.transferCode}" đã tồn tại`,
        );
      }
    }

    const entityData = DtoMapper.mapToEntity<StockTransfer>(
      dto as unknown as Record<string, unknown>,
    );

    // Convert date strings to Date objects
    if (dto.transferDate) {
      entityData.transferDate = new Date(dto.transferDate);
    }
    if (dto.expectedDeliveryDate) {
      entityData.expectedDeliveryDate = new Date(dto.expectedDeliveryDate);
    }
    if (dto.actualDeliveryDate) {
      entityData.actualDeliveryDate = new Date(dto.actualDeliveryDate);
    }

    const updated = repo.merge(transfer, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const transfer = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Check if transfer can be deleted
    if (transfer.status === 'completed') {
      throw new BadRequestException(
        '❌ Không thể xóa phiếu chuyển kho đã hoàn thành',
      );
    }

    // Soft delete
    transfer.isDeleted = true;
    transfer.deletedAt = new Date();
    await repo.save(transfer);

    return {
      message: `✅ Phiếu chuyển kho với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const transfer = await repo.findOne({
      where: { id, storeId, isDeleted: true },
    });

    if (!transfer) {
      throw new NotFoundException(
        `Phiếu chuyển kho với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    transfer.isDeleted = false;
    transfer.deletedAt = undefined;
    const restored = await repo.save(transfer);

    return {
      message: `✅ Phiếu chuyển kho với ID "${id}" đã được khôi phục`,
      data: restored,
    };
  }

  async getTransferItems(
    storeId: string,
    transferId: string,
  ): Promise<StockTransferItem[]> {
    const repo = await this.getRepo(storeId);
    const itemRepo = repo.manager.getRepository(StockTransferItem);

    return await itemRepo.find({
      where: { stockTransferId: transferId, storeId, isDeleted: false },
      relations: ['product'],
      order: { createdAt: 'ASC' },
    });
  }

  private async validateForeignKeys(
    storeId: string,
    dto: CreateStockTransferDto | UpdateStockTransferDto,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);

    // Validate from_store_id exists
    if (dto.fromStoreId) {
      const fromStore = await repo.manager.findOne('store', {
        where: { id: dto.fromStoreId, is_deleted: false },
      });
      if (!fromStore) {
        throw new NotFoundException(
          `Store with ID ${dto.fromStoreId} not found`,
        );
      }
    }

    // Validate to_store_id exists
    if (dto.toStoreId) {
      const toStore = await repo.manager.findOne('store', {
        where: { id: dto.toStoreId, is_deleted: false },
      });
      if (!toStore) {
        throw new NotFoundException(`Store with ID ${dto.toStoreId} not found`);
      }
    }

    // Validate products exist (for create operation)
    if ('items' in dto && dto.items) {
      for (const item of dto.items) {
        const product = await repo.manager.findOne('product', {
          where: { product_id: item.productId, is_deleted: false },
        });
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }
      }
    }

    // Validate users exist
    if (dto.createdByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.createdByUserId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.createdByUserId} not found`,
        );
      }
    }

    // Validate update-specific fields
    if ('updatedByUserId' in dto && dto.updatedByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.updatedByUserId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.updatedByUserId} not found`,
        );
      }
    }

    if ('approvedByUserId' in dto && dto.approvedByUserId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.approvedByUserId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${dto.approvedByUserId} not found`,
        );
      }
    }
  }
}
