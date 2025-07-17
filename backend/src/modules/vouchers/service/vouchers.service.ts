import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Voucher } from 'src/entities/tenant/voucher.entity';
import { CreateVoucherDto } from 'src/modules/vouchers/dto/create-voucher.dto';
import { UpdateVoucherDto } from 'src/modules/vouchers/dto/update-voucher.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { VoucherType } from 'src/entities/tenant/voucher.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class VouchersService extends TenantBaseService<Voucher> {
  protected readonly logger = new Logger(VouchersService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Voucher);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    entityData: DeepPartial<Voucher>,
  ): Promise<Voucher> {
    if (entityData.type && typeof entityData.type === 'string') {
      entityData.type =
        VoucherType[
          (entityData.type as string).toUpperCase() as keyof typeof VoucherType
        ];
    }
    return super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<Voucher | null> {
    try {
      this.logger.debug(`Finding voucher by ID: ${id} in store: ${storeId}`);
      const voucher = await super.findById(storeId, id);
      this.logger.debug(`Voucher found: ${voucher ? 'yes' : 'no'}`);
      return voucher;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find voucher by ID: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<Voucher> {
    this.logger.debug(`Finding voucher by ID: ${id} in store: ${storeId}`);

    try {
      const voucher = await super.findByIdOrFail(storeId, id);

      if (voucher.is_deleted) {
        this.logger.warn(
          `Voucher ${id} in store ${storeId} is marked as deleted`,
        );
        throw new NotFoundException(`Voucher with ID ${id} not found`);
      }

      this.logger.debug(`Voucher found: ${id}`);
      return voucher;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Unknown error during findOne';
      this.logger.error(
        `Error finding voucher ${id}: ${msg}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async findAll(storeId: string) {
    try {
      this.logger.debug(`Finding all vouchers for store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const vouchers = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
      });
      this.logger.debug(`Found ${vouchers.length} vouchers`);
      return vouchers;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find all vouchers: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async update(storeId: string, id: string, dto: UpdateVoucherDto) {
    try {
      this.logger.log(`Updating voucher: ${id} in store: ${storeId}`);
      const voucher = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);

      // Validate foreign keys and business rules
      await this.validateVoucherData(storeId, dto);

      const entityData = DtoMapper.mapToEntity<Voucher>(
        dto as unknown as Record<string, unknown>,
      );
      const updated = repo.merge(voucher, entityData);
      const saved = await repo.save(updated);
      this.logger.log(`Voucher updated successfully: ${id}`);
      return saved;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update voucher: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async remove(storeId: string, id: string) {
    try {
      this.logger.log(`Removing voucher: ${id} from store: ${storeId}`);
      const voucher = await this.findOne(storeId, id);
      const repo = await this.getRepo(storeId);

      // Soft delete
      voucher.is_deleted = true;
      await repo.save(voucher);
      this.logger.log(`Voucher soft deleted successfully: ${id}`);

      return {
        message: `✅ Voucher với ID "${id}" đã được xóa mềm`,
        data: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove voucher: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restore(storeId: string, id: string) {
    try {
      this.logger.log(`Restoring voucher: ${id} in store: ${storeId}`);
      const repo = await this.getRepo(storeId);
      const voucher = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!voucher) {
        throw new NotFoundException(
          `Voucher với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
        );
      }

      // Restore
      voucher.is_deleted = false;
      voucher.deleted_at = undefined;
      const restored = await repo.save(voucher);
      this.logger.log(`Voucher restored successfully: ${id}`);

      return {
        message: `✅ Voucher với ID "${id}" đã được khôi phục`,
        data: restored,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore voucher: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private async validateVoucherData(
    storeId: string,
    dto: CreateVoucherDto | UpdateVoucherDto,
  ): Promise<void> {
    try {
      const repo = await this.getRepo(storeId);

      // Validate created_by_user_id exists
      if (dto.createdByUserId) {
        const user = await repo.manager.findOne('user', {
          where: { userId: dto.createdByUserId, is_deleted: false },
        });
        if (!user) {
          throw new BadRequestException(
            `User with ID ${dto.createdByUserId} not found`,
          );
        }
      }

      // Validate updated_by_user_id exists
      if (dto.updatedByUserId) {
        const user = await repo.manager.findOne('user', {
          where: { userId: dto.updatedByUserId, is_deleted: false },
        });
        if (!user) {
          throw new BadRequestException(
            `User with ID ${dto.updatedByUserId} not found`,
          );
        }
      }

      // Validate business rules
      if (dto.pointsCost !== undefined && dto.pointsCost < 0) {
        throw new BadRequestException('Points cost cannot be negative');
      }

      if (dto.value !== undefined) {
        const value = parseFloat(dto.value);
        if (isNaN(value) || value < 0) {
          throw new BadRequestException(
            'Voucher value must be a positive number',
          );
        }
      }

      if (dto.type && !['fixed', 'percentage', 'shipping'].includes(dto.type)) {
        throw new BadRequestException(
          'Voucher type must be one of: fixed, percentage, shipping',
        );
      }
    } catch (error) {
      this.logger.error(
        `Voucher validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
