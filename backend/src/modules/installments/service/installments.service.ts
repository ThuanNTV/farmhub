import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Installment } from 'src/entities/tenant/installment.entity';
import { CreateInstallmentDto } from 'src/modules/installments/dto/create-installment.dto';
import { UpdateInstallmentDto } from 'src/modules/installments/dto/update-installment.dto';
import { InstallmentResponseDto } from 'src/modules/installments/dto/installment-response.dto';

@Injectable()
export class InstallmentsService extends TenantBaseService<Installment> {
  protected readonly logger = new Logger(InstallmentsService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Installment);
    this.primaryKey = 'id';
  }

  async createInstallment(
    storeId: string,
    dto: CreateInstallmentDto,
  ): Promise<InstallmentResponseDto> {
    try {
      this.logger.log(`Creating installment for store: ${storeId}`);

      // Validate installment data
      if (dto.amount && parseFloat(dto.amount) <= 0) {
        throw new BadRequestException(
          'Installment amount must be greater than 0',
        );
      }

      if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
        throw new BadRequestException('Due date cannot be in the past');
      }

      const entityData = DtoMapper.mapToEntity<Installment>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`Installment created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findInstallmentById(
    storeId: string,
    id: string,
  ): Promise<InstallmentResponseDto | null> {
    try {
      this.logger.debug(
        `Finding installment by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Installment not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findInstallment(
    storeId: string,
    id: string,
  ): Promise<InstallmentResponseDto> {
    try {
      this.logger.debug(
        `Finding installment by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(`Installment with ID "${id}" not found`);
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllInstallments(
    storeId: string,
  ): Promise<InstallmentResponseDto[]> {
    try {
      this.logger.debug(`Finding all installments for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['order', 'payment_method', 'collected_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} installments`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find installments: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updateInstallment(
    storeId: string,
    id: string,
    dto: UpdateInstallmentDto,
  ): Promise<InstallmentResponseDto> {
    try {
      this.logger.log(`Updating installment: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);

      // Validate update data
      if (dto.amount && parseFloat(dto.amount) <= 0) {
        throw new BadRequestException(
          'Installment amount must be greater than 0',
        );
      }

      if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
        throw new BadRequestException('Due date cannot be in the past');
      }

      const entityData = DtoMapper.mapToEntity<Installment>(
        dto as unknown as Record<string, unknown>,
      );

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Installment with ID "${id}" not found`);
      }
      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Installment updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removeInstallment(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(`Removing installment: ${id} from store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Installment with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      await repo.save(entity);

      this.logger.log(`Installment soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restoreInstallment(
    storeId: string,
    id: string,
  ): Promise<InstallmentResponseDto> {
    try {
      this.logger.log(`Restoring installment: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const installment = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!installment) {
        throw new NotFoundException(
          `Installment with ID "${id}" not found or not deleted`,
        );
      }

      installment.is_deleted = false;
      installment.deleted_at = undefined;
      const restored = await repo.save(installment);

      this.logger.log(`Installment restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore installment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: Installment): InstallmentResponseDto {
    return {
      id: entity.id,
      orderId: entity.order_id,
      installmentNumber: entity.installment_number,
      dueDate: entity.due_date,
      amount: entity.amount,
      paymentMethodId: entity.payment_method_id,
      status: entity.status,
      note: entity.note,
      collectedByUserId: entity.collected_by_user_id,
      paidAt: entity.paid_at,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }
}
