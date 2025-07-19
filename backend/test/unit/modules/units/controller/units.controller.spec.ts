import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UnitsController } from 'src/modules/units/controller/units.controller';
import { UnitsService } from 'src/modules/units/service/units.service';
import { CreateUnitDto } from 'src/modules/units/dto/create-unit.dto';
import { UpdateUnitDto } from 'src/modules/units/dto/update-unit.dto';
import { RequestWithUser } from 'src/common/types/common.types';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: jest.Mocked<UnitsService>;

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
  };

  const mockUser: RequestWithUser = {
    user: { id: 'user-123', username: 'testuser', role: 'STORE_MANAGER' },
  } as RequestWithUser;

  const mockCreateDto: CreateUnitDto = {
    unit_name: 'Kilogram',
    unit_code: 'KG',
    unit_symbol: 'kg',
    description: 'Unit of mass',
    base_unit_id: null,
    conversion_factor: 1,
    is_base_unit: true,
    is_active: true,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActive: jest.fn(),
      findBaseUnits: jest.fn(),
      convertUnits: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [{ provide: UnitsService, useValue: mockService }],
    }).compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get(UnitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a unit successfully', async () => {
      service.create.mockResolvedValue(mockUnit);

      const result = await controller.create(mockCreateDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(mockCreateDto, mockUser);
      expect(result).toEqual(mockUnit);
    });

    it('should throw BadRequestException when creation fails', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.create(mockCreateDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all units', async () => {
      service.findAll.mockResolvedValue([mockUnit]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockUnit]);
    });
  });

  describe('findActive', () => {
    it('should return active units', async () => {
      const activeUnits = [{ ...mockUnit, is_active: true }];
      service.findActive.mockResolvedValue(activeUnits);

      const result = await controller.findActive(mockUser);

      expect(service.findActive).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(activeUnits);
    });
  });

  describe('findBaseUnits', () => {
    it('should return base units', async () => {
      const baseUnits = [{ ...mockUnit, is_base_unit: true }];
      service.findBaseUnits.mockResolvedValue(baseUnits);

      const result = await controller.findBaseUnits(mockUser);

      expect(service.findBaseUnits).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(baseUnits);
    });
  });

  describe('findOne', () => {
    it('should return a unit by id', async () => {
      service.findOne.mockResolvedValue(mockUnit);

      const result = await controller.findOne('unit-123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('unit-123', mockUser);
      expect(result).toEqual(mockUnit);
    });

    it('should throw NotFoundException when unit not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Unit not found'));

      await expect(controller.findOne('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a unit successfully', async () => {
      const updateDto = { unit_name: 'Gram', unit_symbol: 'g' };
      const updatedUnit = { ...mockUnit, ...updateDto };
      service.update.mockResolvedValue(updatedUnit);

      const result = await controller.update('unit-123', updateDto, mockUser);

      expect(service.update).toHaveBeenCalledWith('unit-123', updateDto, mockUser);
      expect(result).toEqual(updatedUnit);
    });
  });

  describe('remove', () => {
    it('should remove a unit successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('unit-123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('unit-123', mockUser);
    });
  });

  describe('convertUnits', () => {
    it('should convert units successfully', async () => {
      const conversionResult = { convertedValue: 1000, fromUnit: 'kg', toUnit: 'g' };
      service.convertUnits.mockResolvedValue(conversionResult);

      const result = await controller.convertUnits('unit-123', 'unit-456', 1, mockUser);

      expect(service.convertUnits).toHaveBeenCalledWith('unit-123', 'unit-456', 1, mockUser);
      expect(result).toEqual(conversionResult);
    });
  });
});
