import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository, FindOptionsWhere, Not, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/entities/global/unit.entity';
import { CreateUnitDto } from 'src/modules/units/dto/create-unit.dto';
import { UpdateUnitDto } from 'src/modules/units/dto/update-unit.dto';
import { UnitResponseDto } from 'src/modules/units/dto/unit-response.dto';
import { UnitFilterDto } from 'src/modules/units/dto/unit-filter.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit, 'globalConnection')
    private unitsRepo: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto, userId: string): Promise<Unit> {
    // Validate unique constraint
    await this.validateUniqueConstraint(createUnitDto);

    const unit = this.unitsRepo.create({
      ...createUnitDto,
      created_by_user_id: userId,
      updated_by_user_id: userId,
    });

    return await this.unitsRepo.save(unit);
  }

  async findAll(): Promise<Unit[]> {
    return await this.unitsRepo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
  }

  async findAllWithFilter(filter: UnitFilterDto): Promise<{
    data: Unit[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const where: FindOptionsWhere<Unit> = { is_deleted: false };

    if (filter.search) {
      where.name = Like(`%${filter.search}%`);
    }

    const [data, total] = await this.unitsRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async update(
    id: string,
    updateUnitDto: UpdateUnitDto,
    userId: string,
  ): Promise<Unit> {
    const unit = await this.unitsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    // Validate unique constraint if name is being updated
    if (updateUnitDto.name && updateUnitDto.name !== unit.name) {
      await this.validateUniqueConstraint(updateUnitDto, id);
    }

    Object.assign(unit, {
      ...updateUnitDto,
      updated_by_user_id: userId,
    });

    return await this.unitsRepo.save(unit);
  }

  async remove(id: string, userId: string) {
    const unit = await this.unitsRepo.findOne({
      where: { id, is_deleted: false },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    // Soft delete
    unit.is_deleted = true;
    unit.updated_by_user_id = userId;
    await this.unitsRepo.save(unit);

    return {
      message: `✅ Unit với ID "${id}" đã được xóa mềm`,
      data: null,
    };
  }

  async restore(id: string, userId: string): Promise<Unit> {
    const unit = await this.unitsRepo.findOne({
      where: { id, is_deleted: true },
    });

    if (!unit) {
      throw new NotFoundException(
        `Unit với ID "${id}" không tìm thấy hoặc chưa bị xóa`,
      );
    }

    // Restore
    unit.is_deleted = false;
    unit.updated_by_user_id = userId;

    return await this.unitsRepo.save(unit);
  }

  mapToResponseDto(entity: Unit): UnitResponseDto {
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
    dto: CreateUnitDto | UpdateUnitDto,
    excludeId?: string,
  ): Promise<void> {
    const whereCondition: FindOptionsWhere<Unit> = {
      name: dto.name,
      is_deleted: false,
    };

    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }

    const existingUnit = await this.unitsRepo.findOne({
      where: whereCondition,
    });

    if (existingUnit) {
      throw new ConflictException(
        `Unit with name "${dto.name}" already exists`,
      );
    }
  }
}
