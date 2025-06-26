import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from '../dto/dtoCustomers/create-customer.dto';
import { UpdateCustomerDto } from '../dto/dtoCustomers/update-customer.dto';
import { Customer } from 'src/entities/tenant/customer.entity';
import { TenantBaseService } from 'src/common/helpers/tenant-base.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';

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
      where: { isDeleted: false, isActive: true },
    });
  }

  async findOne(storeId: string, customerId: string) {
    const repo = await this.getRepo(storeId);
    const customer = await repo.findOneBy({
      customerId,
      isDeleted: false,
      isActive: true,
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }
    return customer;
  }

  async update(storeId: string, customerId: string, dto: UpdateCustomerDto) {
    const repo = await this.getRepo(storeId);
    const entity = await this.findByIdOrFail(storeId, customerId);

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

    entity.isDeleted = true;
    await repo.save(entity);
    return {
      message: 'Xóa Khách hàng thành công',
      data: null,
    };
  }
}
