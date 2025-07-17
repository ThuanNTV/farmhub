import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from 'src/entities/tenant/customer.entity';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { CustomerFilter } from 'src/common/types/common.types';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomersService extends TenantBaseService<Customer> {
  protected primaryKey!: string;
  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, Customer);
    this.primaryKey = 'customerId';
  }
  async createCustomer(storeId: string, dto: CreateCustomerDto) {
    const repo = await this.getRepo(storeId);

    // Kiểm tra sản phẩm có ID đã tồn tại
    const existing = await this.findById(storeId, dto.customerId);
    if (existing) {
      throw new InternalServerErrorException(
        `❌ Khách hàng với ID "${dto.customerId}" đã tồn tại`,
      );
    }

    // Validate unique phone
    if (dto.phone) {
      const existingPhone = await repo.findOne({
        where: { phone: dto.phone, is_deleted: false },
      });
      if (existingPhone) {
        throw new InternalServerErrorException(
          `❌ Số điện thoại "${dto.phone}" đã tồn tại!`,
        );
      }
    }
    // Validate unique email
    if (dto.email) {
      const existingEmail = await repo.findOne({
        where: { email: dto.email, is_deleted: false },
      });
      if (existingEmail) {
        throw new InternalServerErrorException(
          `❌ Email "${dto.email}" đã tồn tại!`,
        );
      }
    }
    // Validate ref_code là customer_id hợp lệ (nếu có)
    if (dto.refCode) {
      const refCustomer = await repo.findOne({
        where: { customer_id: dto.refCode, is_deleted: false },
      });
      if (!refCustomer) {
        throw new InternalServerErrorException(
          `❌ refCode "${dto.refCode}" không tồn tại!`,
        );
      }
    }
    // Validate createdByUserId/updatedByUserId là user_id hợp lệ (nếu có)
    if (dto.createdByUserId) {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOne({
        where: { userId: dto.createdByUserId, is_deleted: false },
      });
      if (!user) {
        throw new InternalServerErrorException(
          `❌ createdByUserId "${dto.createdByUserId}" không tồn tại!`,
        );
      }
    }
    if (dto.updatedByUserId) {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOne({
        where: { userId: dto.updatedByUserId, is_deleted: false },
      });
      if (!user) {
        throw new InternalServerErrorException(
          `❌ updatedByUserId "${dto.updatedByUserId}" không tồn tại!`,
        );
      }
    }
    // Validate/mapping createdByUserId, updatedByUserId là string
    if (dto.createdByUserId && typeof dto.createdByUserId !== 'string') {
      throw new InternalServerErrorException('createdByUserId phải là string');
    }
    if (dto.updatedByUserId && typeof dto.updatedByUserId !== 'string') {
      throw new InternalServerErrorException('updatedByUserId phải là string');
    }
    // Validate format phone
    if (dto.phone && !/^\d{10,20}$/.test(dto.phone)) {
      throw new InternalServerErrorException('Số điện thoại không hợp lệ!');
    }
    // Validate format email
    if (dto.email && !/^\S+@\S+\.\S+$/.test(dto.email)) {
      throw new InternalServerErrorException('Email không hợp lệ!');
    }
    // Validate format birthday
    if (dto.birthday && isNaN(Date.parse(dto.birthday))) {
      throw new InternalServerErrorException('Ngày sinh không hợp lệ!');
    }

    const customer = repo.create(dto);
    const saveEntity = await repo.save(customer);
    return {
      message: 'Thêm mới thành công',
      data: saveEntity,
    };
  }

  async findAll(storeId: string) {
    const repo = await this.getRepo(storeId);

    return await repo.find({
      where: { is_deleted: false, is_active: true },
    });
  }

  async findOne(storeId: string, customerId: string) {
    const repo = await this.getRepo(storeId);
    const customer = await repo.findOneBy({
      customer_id: customerId,
      is_deleted: false,
      is_active: true,
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    return customer;
  }

  async update(storeId: string, customerId: string, dto: UpdateCustomerDto) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, customerId);

    // Validate unique phone (trừ chính nó)
    if (dto.phone && dto.phone !== entity.phone) {
      const existingPhone = await repo.findOne({
        where: { phone: dto.phone, is_deleted: false },
      });
      if (existingPhone) {
        throw new InternalServerErrorException(
          `❌ Số điện thoại "${dto.phone}" đã tồn tại!`,
        );
      }
    }
    // Validate unique email (trừ chính nó)
    if (dto.email && dto.email !== entity.email) {
      const existingEmail = await repo.findOne({
        where: { email: dto.email, is_deleted: false },
      });
      if (existingEmail) {
        throw new InternalServerErrorException(
          `❌ Email "${dto.email}" đã tồn tại!`,
        );
      }
    }
    // Validate ref_code là customer_id hợp lệ (nếu có và thay đổi)
    if (dto.refCode && dto.refCode !== entity.ref_code) {
      const refCustomer = await repo.findOne({
        where: { customer_id: dto.refCode, is_deleted: false },
      });
      if (!refCustomer) {
        throw new InternalServerErrorException(
          `❌ refCode "${dto.refCode}" không tồn tại!`,
        );
      }
    }
    // Validate createdByUserId/updatedByUserId là user_id hợp lệ (nếu có và thay đổi)
    if (
      dto.createdByUserId &&
      dto.createdByUserId !== entity.created_by_user_id
    ) {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOne({
        where: { userId: dto.createdByUserId, is_deleted: false },
      });
      if (!user) {
        throw new InternalServerErrorException(
          `❌ createdByUserId "${dto.createdByUserId}" không tồn tại!`,
        );
      }
    }
    if (
      dto.updatedByUserId &&
      dto.updatedByUserId !== entity.updated_by_user_id
    ) {
      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const userRepo = dataSource.getRepository('User');
      const user = await userRepo.findOne({
        where: { userId: dto.updatedByUserId, is_deleted: false },
      });
      if (!user) {
        throw new InternalServerErrorException(
          `❌ updatedByUserId "${dto.updatedByUserId}" không tồn tại!`,
        );
      }
    }
    // Validate format phone
    if (dto.phone && !/^\d{10,20}$/.test(dto.phone)) {
      throw new InternalServerErrorException('Số điện thoại không hợp lệ!');
    }
    // Validate format email
    if (dto.email && !/^\S+@\S+\.\S+$/.test(dto.email)) {
      throw new InternalServerErrorException('Email không hợp lệ!');
    }
    // Validate format birthday
    if (dto.birthday && isNaN(Date.parse(dto.birthday))) {
      throw new InternalServerErrorException('Ngày sinh không hợp lệ!');
    }

    const updated = repo.merge(entity, dto);
    const updatedEntity = await repo.save(updated);
    return {
      message: 'Cập nhập khách hàng thành công!',
      data: updatedEntity,
    };
  }

  async remove(storeId: string, customerId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, customerId);

    // Không cho xóa nếu có order liên quan
    if (entity.orders.length > 0) {
      throw new InternalServerErrorException(
        'Không thể xóa khách hàng có đơn hàng liên quan!',
      );
    }

    entity.is_deleted = true;
    await repo.save(entity);
    return {
      message: 'Xóa Khách hàng thành công',
      data: null,
    };
  }

  async restore(storeId: string, customerId: string) {
    const repo = await this.getRepo(storeId);
    const entity = await repo.findOne({
      where: { customer_id: customerId, is_deleted: true },
    });
    if (!entity) {
      throw new InternalServerErrorException(
        'Khách hàng không tồn tại hoặc chưa bị xóa mềm',
      );
    }
    entity.is_deleted = false;
    await repo.save(entity);
    return {
      message: 'Khôi phục khách hàng thành công',
      data: entity,
    };
  }

  async search(storeId: string, keyword: string) {
    const repo = await this.getRepo(storeId);
    return await repo
      .createQueryBuilder('customer')
      .where('customer.storeId = :storeId', { storeId })
      .andWhere('customer.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('customer.isActive = :isActive', { isActive: true })
      .andWhere(
        '(customer.customer_name ILIKE :keyword OR customer.email ILIKE :keyword OR customer.phone ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .getMany();
  }

  async filter(storeId: string, filter: CustomerFilter) {
    const repo = await this.getRepo(storeId);
    const qb = repo
      .createQueryBuilder('customer')
      .where('customer.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('customer.isActive = :isActive', { isActive: true });
    if (filter.status) {
      qb.andWhere('customer.status = :status', { status: filter.status });
    }
    if (filter.category) {
      qb.andWhere('customer.category = :category', {
        category: filter.category,
      });
    }
    if (filter.dateFrom) {
      qb.andWhere('customer.createdAt >= :dateFrom', {
        dateFrom: filter.dateFrom,
      });
    }
    if (filter.dateTo) {
      qb.andWhere('customer.createdAt <= :dateTo', { dateTo: filter.dateTo });
    }
    if (filter.search) {
      qb.andWhere(
        '(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }
    if (filter.sortBy) {
      qb.orderBy(`customer.${filter.sortBy}`, filter.sortOrder ?? 'ASC');
    }
    if (filter.page && filter.limit) {
      qb.skip((filter.page - 1) * filter.limit).take(filter.limit);
    }
    return qb.getMany();
  }
}
