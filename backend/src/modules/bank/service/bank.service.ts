import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from 'src/entities/global/bank.entity';
import { CreateBankDto } from 'src/modules/bank/dto/create-bank.dto';
import { UpdateBankDto } from 'src/modules/bank/dto/update-bank.dto';
import { BankFilterDto } from 'src/modules/bank/dto/bank-filter.dto';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank, 'globalConnection')
    private banksRepo: Repository<Bank>,
  ) {}

  async create(dto: CreateBankDto, userId: string): Promise<Bank> {
    const entity = this.banksRepo.create({
      ...dto,
      created_by_user_id: userId,
      is_deleted: false,
    });
    return await this.banksRepo.save(entity);
  }

  async findAll(): Promise<Bank[]> {
    return await this.banksRepo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
  }

  async findAllWithFilter(query: BankFilterDto): Promise<{
    data: Bank[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.banksRepo
      .createQueryBuilder('b')
      .where('b.is_deleted = :isDeleted', { isDeleted: false });

    if (query.search) {
      qb.andWhere('LOWER(b.name) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    qb.orderBy('b.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Bank> {
    const bank = await this.banksRepo.findOneBy({ id, is_deleted: false });
    if (!bank) throw new NotFoundException('Bank not found');
    return bank;
  }

  async update(id: string, dto: UpdateBankDto, userId: string): Promise<Bank> {
    const bank = await this.banksRepo.findOneBy({ id, is_deleted: false });
    if (!bank) throw new NotFoundException('Bank not found');
    const updated = this.banksRepo.merge(bank, dto, {
      updated_by_user_id: userId,
    });
    return await this.banksRepo.save(updated);
  }

  async remove(id: string, userId: string) {
    const bank = await this.banksRepo.findOneBy({ id, is_deleted: false });
    if (!bank) throw new NotFoundException('Bank not found');
    bank.is_deleted = true;
    bank.updated_by_user_id = userId;
    await this.banksRepo.save(bank);

    return {
      message: `✅ Bank với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(id: string, userId: string): Promise<Bank> {
    const bank = await this.banksRepo.findOne({
      where: { id, is_deleted: true },
    });

    if (!bank) {
      throw new NotFoundException(
        `Bank với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    bank.is_deleted = false;
    bank.updated_by_user_id = userId;
    return await this.banksRepo.save(bank);
  }
}
