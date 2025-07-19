import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { CreateDebtTransactionDto } from 'src/modules/debt-transactions/dto/create-debtTransaction.dto';
import { UpdateDebtTransactionDto } from 'src/modules/debt-transactions/dto/update-debtTransaction.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { DebtTransaction } from 'src/entities/tenant/debt_transaction.entity';

@Injectable()
export class DebtTransactionsService extends TenantBaseService<DebtTransaction> {
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, DebtTransaction);
    this.primaryKey = 'id';
  }

  async create(
    storeId: string,
    dto: CreateDebtTransactionDto,
  ): Promise<DebtTransaction> {
    const repo = await this.getRepo(storeId);

    // Validate customer_id
    const customer = await repo.manager.findOne('Customer', {
      where: { customerId: dto.customerId, is_deleted: false },
    });
    if (!customer)
      throw new BadRequestException(
        `customer_id ${dto.customerId} không tồn tại!`,
      );
    // Validate payment_method_id
    const paymentMethod = await repo.manager.findOne('PaymentMethod', {
      where: { paymentMethodId: dto.paymentMethodId, is_deleted: false },
    });
    if (!paymentMethod)
      throw new BadRequestException(
        `payment_method_id ${dto.paymentMethodId} không tồn tại!`,
      );
    // Validate paid_by_user_id
    const user = await repo.manager.findOne('User', {
      where: { userId: dto.paidByUserId, is_deleted: false },
    });
    if (!user)
      throw new BadRequestException(
        `paid_by_user_id ${dto.paidByUserId} không tồn tại!`,
      );

    const entityData = DtoMapper.mapToEntity<DebtTransaction>(
      dto as unknown as Record<string, unknown>,
    );
    return await super.create(storeId, entityData);
  }

  async findById(storeId: string, id: string): Promise<DebtTransaction | null> {
    const repo = await this.getRepo(storeId);
    return await repo.findOne({ where: { id, is_deleted: false } });
  }

  async findOne(storeId: string, id: string): Promise<DebtTransaction> {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id, is_deleted: false } });
    if (!entity)
      throw new NotFoundException('DebtTransaction not found or deleted');
    return entity;
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({ where: { is_deleted: false } });
  }

  async update(storeId: string, id: string, dto: UpdateDebtTransactionDto) {
    const repo = await this.getRepo(storeId);
    const debtTransaction = await this.findOne(storeId, id);

    // Validate customer_id nếu thay đổi
    if (dto.customerId && dto.customerId !== debtTransaction.customer_id) {
      const customer = await repo.manager.findOne('Customer', {
        where: { customerId: dto.customerId, is_deleted: false },
      });
      if (!customer)
        throw new BadRequestException(
          `customer_id ${dto.customerId} không tồn tại!`,
        );
    }
    // Validate payment_method_id nếu thay đổi
    if (
      dto.paymentMethodId &&
      dto.paymentMethodId !== debtTransaction.payment_method_id
    ) {
      const paymentMethod = await repo.manager.findOne('PaymentMethod', {
        where: { paymentMethodId: dto.paymentMethodId, is_deleted: false },
      });
      if (!paymentMethod)
        throw new BadRequestException(
          `payment_method_id ${dto.paymentMethodId} không tồn tại!`,
        );
    }
    // Validate paid_by_user_id nếu thay đổi
    if (
      dto.paidByUserId &&
      dto.paidByUserId !== debtTransaction.paid_by_user_id
    ) {
      const user = await repo.manager.findOne('User', {
        where: { userId: dto.paidByUserId, is_deleted: false },
      });
      if (!user)
        throw new BadRequestException(
          `paid_by_user_id ${dto.paidByUserId} không tồn tại!`,
        );
    }

    const entityData = DtoMapper.mapToEntity<DebtTransaction>(
      dto as unknown as Record<string, unknown>,
    );
    const updated = repo.merge(debtTransaction, entityData);
    return await repo.save(updated);
  }

  async remove(storeId: string, id: string) {
    const debtTransaction = await this.findOne(storeId, id);
    const repo = await this.getRepo(storeId);

    debtTransaction.is_deleted = true;
    await repo.save(debtTransaction);
    return {
      message: `✅ DebtTransaction với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(storeId: string, id: string) {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({ where: { id, is_deleted: true } });
    if (!entity)
      throw new NotFoundException('DebtTransaction not found or not deleted');
    entity.is_deleted = false;
    await repo.save(entity);
    return {
      message: 'Khôi phục debt transaction thành công',
      data: entity,
    };
  }
}
