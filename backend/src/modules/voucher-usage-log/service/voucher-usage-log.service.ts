import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { VoucherUsageLog } from 'src/entities/tenant/voucher_usage_log.entity';
import { CreateVoucherUsageLogDto } from 'src/modules/voucher-usage-log/dto/create-voucherUsageLog.dto';
import { UpdateVoucherUsageLogDto } from 'src/modules/voucher-usage-log/dto/update-voucherUsageLog.dto';

interface DiscountResult {
  totalDiscount: string; // vì SQL trả string
}

interface TopVoucherResult {
  voucherCode: string;
  usageCount: string; // luôn là string vì SQL aggregate
}

@Injectable()
export class VoucherUsageLogService extends TenantBaseService<VoucherUsageLog> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, VoucherUsageLog);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateVoucherUsageLogDto,
  ): Promise<VoucherUsageLog> {
    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<VoucherUsageLog>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<VoucherUsageLog | null> {
    return await super.findById(storeId, id);
  }

  async findOne(storeId: string, id: string): Promise<VoucherUsageLog> {
    return await super.findByIdOrFail(storeId, id);
  }

  async findAll(storeId: string): Promise<VoucherUsageLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, isDeleted: false },
      relations: ['voucher', 'user', 'order'],
      order: { created_at: 'DESC' },
    });
  }

  async findByVoucher(
    storeId: string,
    voucherId: string,
  ): Promise<VoucherUsageLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, voucherId, isDeleted: false },
      relations: ['voucher', 'user', 'order'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(
    storeId: string,
    userId: string,
  ): Promise<VoucherUsageLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, userId, isDeleted: false },
      relations: ['voucher', 'user', 'order'],
      order: { created_at: 'DESC' },
    });
  }

  async findByOrder(
    storeId: string,
    orderId: string,
  ): Promise<VoucherUsageLog[]> {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      where: { storeId, orderId, isDeleted: false },
      relations: ['voucher', 'user', 'order'],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    storeId: string,
    id: string,
    dto: UpdateVoucherUsageLogDto,
  ): Promise<VoucherUsageLog> {
    const log = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Validate foreign keys
    await this.validateForeignKeys(storeId, dto);

    const entityData = DtoMapper.mapToEntity<VoucherUsageLog>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(log, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const log = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    // Soft delete
    log.isDeleted = true;
    log.deleted_at = new Date();
    await repo.save(log);

    return {
      message: `✅ Voucher usage log với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const log = await repo.findOne({
      where: { id, storeId, isDeleted: true },
    });

    if (!log) {
      throw new NotFoundException(
        `Voucher usage log với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    log.isDeleted = false;
    log.deleted_at = undefined;
    const restored = await repo.save(log);

    return {
      message: `✅ Voucher usage log với ID "${id}" đã được khôi phục`,
      data: restored,
    };
  }

  async getStats(storeId: string) {
    const repo = await this.getRepo(storeId);

    // Get total usage count
    const totalUsed = await repo.count({
      where: { storeId, isDeleted: false },
    });

    // Get total discount amount
    const totalDiscountResult = await repo
      .createQueryBuilder('log')
      .select('SUM(log.discountAmount)', 'totalDiscount')
      .where('log.storeId = :storeId AND log.isDeleted = :isDeleted', {
        storeId,
        isDeleted: false,
      })
      .getRawOne<DiscountResult>();

    const totalDiscount = parseFloat(totalDiscountResult?.totalDiscount ?? '0');

    // Get top voucher
    const topVoucherResult = await repo
      .createQueryBuilder('log')
      .select('voucher.code', 'voucherCode')
      .addSelect('COUNT(*)', 'usageCount')
      .leftJoin('log.voucher', 'voucher')
      .where('log.storeId = :storeId AND log.isDeleted = :isDeleted', {
        storeId,
        isDeleted: false,
      })
      .groupBy('voucher.code')
      .orderBy('usageCount', 'DESC')
      .limit(1)
      .getRawOne<TopVoucherResult>();

    return {
      totalUsed,
      totalDiscount,
      topVoucher: topVoucherResult?.voucherCode ?? 'N/A',
    };
  }

  async filter(
    storeId: string,
    filters: {
      voucherId?: string;
      userId?: string;
      orderId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const repo = await this.getRepo(storeId);
    const queryBuilder = repo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.voucher', 'voucher')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.order', 'order')
      .where('log.storeId = :storeId AND log.isDeleted = :isDeleted', {
        storeId,
        isDeleted: false,
      });

    if (filters.voucherId) {
      queryBuilder.andWhere('log.voucherId = :voucherId', {
        voucherId: filters.voucherId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.orderId) {
      queryBuilder.andWhere('log.orderId = :orderId', {
        orderId: filters.orderId,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('log.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('log.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    queryBuilder.orderBy('log.created_at', 'DESC');

    return await queryBuilder.getMany();
  }

  private async validateForeignKeys(
    storeId: string,
    dto: CreateVoucherUsageLogDto | UpdateVoucherUsageLogDto,
  ): Promise<void> {
    const repo = await this.getRepo(storeId);

    // Validate voucher_id exists
    if (dto.voucherId) {
      const voucher = await repo.manager.findOne('voucher', {
        where: { id: dto.voucherId, is_deleted: false },
      });
      if (!voucher) {
        throw new NotFoundException(
          `Voucher with ID ${dto.voucherId} not found`,
        );
      }
    }

    // Validate user_id exists
    if (dto.userId) {
      const user = await repo.manager.findOne('user', {
        where: { id: dto.userId, is_deleted: false },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }
    }

    // Validate order_id exists (if provided)
    if (dto.orderId) {
      const order = await repo.manager.findOne('order', {
        where: { order_id: dto.orderId, is_deleted: false },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
      }
    }
  }
}
