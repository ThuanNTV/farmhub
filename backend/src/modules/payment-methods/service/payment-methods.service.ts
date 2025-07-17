import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository, FindOptionsWhere, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from 'src/entities/global/payment_method.entity';
import { CreatePaymentMethodDto } from 'src/modules/payment-methods/dto/create-paymentMethod.dto';
import { UpdatePaymentMethodDto } from 'src/modules/payment-methods/dto/update-paymentMethod.dto';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/paymentMethod-response.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod, 'globalConnection')
    private paymentMethodsRepo: Repository<PaymentMethod>,
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
    userId: string,
  ): Promise<PaymentMethod> {
    // Validate unique constraint
    await this.validateUniqueConstraint(createPaymentMethodDto);

    const paymentMethod = this.paymentMethodsRepo.create({
      ...createPaymentMethodDto,
      created_by_user_id: userId,
      updated_by_user_id: userId,
    });

    return await this.paymentMethodsRepo.save(paymentMethod);
  }

  async findAll(): Promise<PaymentMethod[]> {
    return await this.paymentMethodsRepo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async update(
    id: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    userId: string,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // Validate unique constraint if name is being updated
    if (
      updatePaymentMethodDto.name &&
      updatePaymentMethodDto.name !== paymentMethod.name
    ) {
      await this.validateUniqueConstraint(updatePaymentMethodDto, id);
    }

    Object.assign(paymentMethod, {
      ...updatePaymentMethodDto,
      updated_by_user_id: userId,
    });

    return await this.paymentMethodsRepo.save(paymentMethod);
  }

  async remove(id: string, userId: string) {
    const paymentMethod = await this.paymentMethodsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // Soft delete
    paymentMethod.is_deleted = true;
    paymentMethod.updated_by_user_id = userId;
    await this.paymentMethodsRepo.save(paymentMethod);

    return {
      message: `✅ Payment method với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodsRepo.findOne({
      where: { id, is_deleted: true },
    });

    if (!paymentMethod) {
      throw new NotFoundException(
        `Payment method với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    paymentMethod.is_deleted = false;
    paymentMethod.updated_by_user_id = userId;

    return await this.paymentMethodsRepo.save(paymentMethod);
  }

  mapToResponseDto(entity: PaymentMethod): PaymentMethodResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      deletedAt: entity.deleted_at,
      isDeleted: entity.is_deleted,
      createdByUserId: entity.created_by_user_id,
      updatedByUserId: entity.updated_by_user_id,
    };
  }

  private async validateUniqueConstraint(
    dto: CreatePaymentMethodDto | UpdatePaymentMethodDto,
    excludeId?: string,
  ): Promise<void> {
    const whereCondition: FindOptionsWhere<PaymentMethod> = {
      name: dto.name,
      is_deleted: false,
    };

    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    const existingPaymentMethod = await this.paymentMethodsRepo.findOne({
      where: whereCondition,
    });

    if (existingPaymentMethod) {
      throw new ConflictException(
        `Payment method with name "${dto.name}" already exists`,
      );
    }
  }
}
