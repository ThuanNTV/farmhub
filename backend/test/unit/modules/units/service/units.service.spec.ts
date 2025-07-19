import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UnitsService } from 'src/modules/units/service/units.service';
import { Unit } from 'src/entities/tenant/unit.entity';
import { CreateUnitDto } from 'src/modules/units/dto/create-unit.dto';
import { UpdateUnitDto } from 'src/modules/units/dto/update-unit.dto';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { RequestWithUser } from 'src/common/types/common.types';

describe('UnitsService', () => {
  let service: UnitsService;
  let repository: jest.Mocked<Repository<Unit>>;

  const mockUnit = {
    unit_id: 'unit-123',
    unit_name: 'Kilogram',
    unit_code: 'KG',
    unit_symbol: 'kg',
    description: 'Unit of mass',
    base_unit_id: null,
    conversion_factor: 1,
    is_base_unit: true,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
  } as Unit;

  const mockUser: RequestWithUser = {
    user: { id: 'user-123', username: 'testuser', role: 'STORE_MANAGER' },
  } as RequestWithUser;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        { provide: getRepositoryToken(Unit), useValue: mockRepository },
        {
          provide: TenantDataSourceService,
          useValue: {
            getTenantRepository: jest.fn().mockReturnValue(mockRepository),
          },
        },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
    repository = module.get(getRepositoryToken(Unit));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a unit successfully', async () => {
      repository.create.mockReturnValue(mockUnit);
      repository.save.mockResolvedValue(mockUnit);

      const createDto = {
        unit_name: 'Kilogram',
        unit_code: 'KG',
        unit_symbol: 'kg',
        description: 'Unit of mass',
        base_unit_id: null,
        conversion_factor: 1,
        is_base_unit: true,
        is_active: true,
      };

      const result = await service.create(createDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockUnit);
      expect(result).toEqual(mockUnit);
    });

    it('should throw BadRequestException when save fails', async () => {
      repository.create.mockReturnValue(mockUnit);
      repository.save.mockRejectedValue(new Error('Database error'));

      const createDto = {
        unit_name: 'Kilogram',
        unit_code: 'KG',
        unit_symbol: 'kg',
        description: 'Unit of mass',
        base_unit_id: null,
        conversion_factor: 1,
        is_base_unit: true,
        is_active: true,
      };

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all units', async () => {
      repository.find.mockResolvedValue([mockUnit]);

      const result = await service.findAll(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false },
        order: { unit_name: 'ASC' },
      });
      expect(result).toEqual([mockUnit]);
    });
  });

  describe('findActive', () => {
    it('should return active units', async () => {
      const activeUnits = [{ ...mockUnit, is_active: true }];
      repository.find.mockResolvedValue(activeUnits);

      const result = await service.findActive(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false, is_active: true },
        order: { unit_name: 'ASC' },
      });
      expect(result).toEqual(activeUnits);
    });
  });

  describe('findBaseUnits', () => {
    it('should return base units', async () => {
      const baseUnits = [{ ...mockUnit, is_base_unit: true }];
      repository.find.mockResolvedValue(baseUnits);

      const result = await service.findBaseUnits(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { is_deleted: false, is_base_unit: true },
        order: { unit_name: 'ASC' },
      });
      expect(result).toEqual(baseUnits);
    });
  });

  describe('findOne', () => {
    it('should return a unit by id', async () => {
      repository.findOne.mockResolvedValue(mockUnit);

      const result = await service.findOne('unit-123', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { unit_id: 'unit-123', is_deleted: false },
      });
      expect(result).toEqual(mockUnit);
    });

    it('should throw NotFoundException when unit not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a unit successfully', async () => {
      repository.findOne.mockResolvedValue(mockUnit);
      const updateDto = { unit_name: 'Gram', unit_symbol: 'g' };
      const updatedUnit = { ...mockUnit, ...updateDto };
      repository.save.mockResolvedValue(updatedUnit);

      const result = await service.update('unit-123', updateDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { unit_id: 'unit-123', is_deleted: false },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUnit);
    });
  });

  describe('remove', () => {
    it('should soft delete a unit successfully', async () => {
      repository.findOne.mockResolvedValue(mockUnit);
      repository.save.mockResolvedValue({ ...mockUnit, is_deleted: true });

      await service.remove('unit-123', mockUser);

      expect(repository.save).toHaveBeenCalledWith({
        ...mockUnit,
        is_deleted: true,
      });
    });
  });

  describe('convertUnits', () => {
    it('should convert units successfully', async () => {
      const fromUnit = { ...mockUnit, conversion_factor: 1 };
      const toUnit = {
        ...mockUnit,
        unit_id: 'unit-456',
        conversion_factor: 1000,
      };

      repository.findOne
        .mockResolvedValueOnce(fromUnit)
        .mockResolvedValueOnce(toUnit);

      const result = await service.convertUnits(
        'unit-123',
        'unit-456',
        1,
        mockUser,
      );

      expect(result).toEqual({
        convertedValue: 1000,
        fromUnit: fromUnit.unit_symbol,
        toUnit: toUnit.unit_symbol,
      });
    });

    it('should throw NotFoundException when units not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.convertUnits('unit-123', 'unit-456', 1, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
