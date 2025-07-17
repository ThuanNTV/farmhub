import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from 'src/entities/global/bank.entity';
import { CreateBankDto } from 'src/modules/bank/dto/create-bank.dto';
import { UpdateBankDto } from 'src/modules/bank/dto/update-bank.dto';

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
