import { Test, TestingModule } from '@nestjs/testing';
import { UnitsController } from '@modules/units/controller/units.controller';
import { UnitsService } from '@modules/units/service/units.service';
import { CreateUnitDto } from '@modules/units/dto/create-unit.dto';
import { UpdateUnitDto } from '@modules/units/dto/update-unit.dto';
import { UnitResponseDto } from '@modules/units/dto/unit-response.dto';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnhancedAuthGuard } from '@common/auth/enhanced-auth.guard';
import { PermissionGuard } from '@core/rbac/permission/permission.guard';
import { AuditInterceptor } from '@common/auth/audit.interceptor';

describe('UnitsController', () => {
  let controller: UnitsController;
  let service: jest.Mocked<UnitsService>;
  let module: TestingModule;

  // Mock data
  const mockUnitEntity = {
    id: 'unit-123',
    name: 'Kilogram',
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:30:00Z'),
    deleted_at: undefined,
    is_deleted: false,
    created_by_user_id: 'user-123',
    updated_by_user_id: 'user-123',
  };

  const mockUnitResponse: UnitResponseDto = {
    id: 'unit-123',
    name: 'Kilogram',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    deletedAt: undefined,
    isDeleted: false,
    createdByUserId: 'user-123',
    updatedByUserId: 'user-123',
  };

  const mockCreateDto: CreateUnitDto = {
    name: 'Kilogram',
    id: 'unit-123',
    createdByUserId: 'user-123',
  };

  const mockUpdateDto: UpdateUnitDto = {
    name: 'Updated Kilogram',
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    // Create mock service
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
      mapToResponseDto: jest.fn(),
    };

    // Create mock guard
    const mockGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    module = await Test.createTestingModule({
      controllers: [UnitsController],
      providers: [
        {
          provide: UnitsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(EnhancedAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(PermissionGuard)
      .useValue(mockGuard)
      .overrideInterceptor(AuditInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<UnitsController>(UnitsController);
    service = module.get<jest.Mocked<UnitsService>>(UnitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a unit successfully', async () => {
      service.create.mockResolvedValue(mockUnitEntity);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);

      const result = await controller.create(mockCreateDto, mockRequest as any);

      expect(result).toEqual(mockUnitResponse);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateDto,
        mockRequest.user.id,
      );
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockUnitEntity);
    });

    it('should handle creation errors', async () => {
      service.create.mockRejectedValue(
        new BadRequestException('Invalid unit data'),
      );

      await expect(
        controller.create(mockCreateDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle duplicate unit name', async () => {
      service.create.mockRejectedValue(
        new ConflictException('Unit with name "Kilogram" already exists'),
      );

      await expect(
        controller.create(mockCreateDto, mockRequest as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all units', async () => {
      const mockUnits = [mockUnitEntity];
      service.findAll.mockResolvedValue(mockUnits);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);

      const result = await controller.findAll();

      expect(result).toEqual([mockUnitResponse]);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.mapToResponseDto).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Database connection failed'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const unitId = 'unit-123';

    it('should return unit by ID', async () => {
      service.findOne.mockResolvedValue(mockUnitEntity);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);

      const result = await controller.findOne(unitId);

      expect(result).toEqual(mockUnitResponse);
      expect(service.findOne).toHaveBeenCalledWith(unitId);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockUnitEntity);
    });

    it('should handle unit not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Unit with ID unit-123 not found'),
      );

      await expect(controller.findOne(unitId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const unitId = 'unit-123';

    it('should update unit successfully', async () => {
      const updatedEntity = { ...mockUnitEntity, ...mockUpdateDto };
      const updatedResponse = { ...mockUnitResponse, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedEntity);
      service.mapToResponseDto.mockReturnValue(updatedResponse);

      const result = await controller.update(
        unitId,
        mockUpdateDto,
        mockRequest as any,
      );

      expect(result).toEqual(updatedResponse);
      expect(service.update).toHaveBeenCalledWith(
        unitId,
        mockUpdateDto,
        mockRequest.user.id,
      );
      expect(service.mapToResponseDto).toHaveBeenCalledWith(updatedEntity);
    });

    it('should handle update validation errors', async () => {
      service.update.mockRejectedValue(
        new BadRequestException('Invalid update data'),
      );

      await expect(
        controller.update(unitId, mockUpdateDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unit not found during update', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Unit with ID unit-123 not found'),
      );

      await expect(
        controller.update(unitId, mockUpdateDto, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const unitId = 'unit-123';

    it('should remove unit successfully', async () => {
      const removeResponse = {
        message: '✅ Unit với ID "unit-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);

      const result = await controller.remove(unitId, mockRequest as any);

      expect(result).toEqual({ message: 'Xóa thành công' });
      expect(service.remove).toHaveBeenCalledWith(unitId, mockRequest.user.id);
    });

    it('should handle remove errors', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Unit with ID unit-123 not found'),
      );

      await expect(
        controller.remove(unitId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    const unitId = 'unit-123';

    it('should restore unit successfully', async () => {
      service.restore.mockResolvedValue(mockUnitEntity);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);

      const result = await controller.restore(unitId, mockRequest as any);

      expect(result).toEqual(mockUnitResponse);
      expect(service.restore).toHaveBeenCalledWith(unitId, mockRequest.user.id);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockUnitEntity);
    });

    it('should handle restore errors', async () => {
      service.restore.mockRejectedValue(
        new NotFoundException('Unit not found or not deleted'),
      );

      await expect(
        controller.restore(unitId, mockRequest as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('business logic validation', () => {
    it('should handle empty unit name', async () => {
      const invalidDto = {
        ...mockCreateDto,
        name: '',
      };

      service.create.mockRejectedValue(
        new BadRequestException('Unit name cannot be empty'),
      );

      await expect(
        controller.create(invalidDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle very long unit name', async () => {
      const longNameDto = {
        ...mockCreateDto,
        name: 'A'.repeat(256), // Very long name
      };

      service.create.mockRejectedValue(
        new BadRequestException('Unit name is too long'),
      );

      await expect(
        controller.create(longNameDto, mockRequest as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unit with special characters', async () => {
      const specialDto = {
        ...mockCreateDto,
        name: 'Mét vuông (m²)',
      };

      const specialEntity = {
        ...mockUnitEntity,
        name: 'Mét vuông (m²)',
      };
      const specialResponse = {
        ...mockUnitResponse,
        name: 'Mét vuông (m²)',
      };
      service.create.mockResolvedValue(specialEntity);
      service.mapToResponseDto.mockReturnValue(specialResponse);

      const result = await controller.create(specialDto, mockRequest as any);

      expect(result.name).toBe('Mét vuông (m²)');
      expect(service.create).toHaveBeenCalledWith(
        specialDto,
        mockRequest.user.id,
      );
    });

    it('should handle case-sensitive unit names', async () => {
      const upperCaseDto = {
        ...mockCreateDto,
        name: 'KILOGRAM',
      };

      service.create.mockRejectedValue(
        new ConflictException('Unit with name "KILOGRAM" already exists'),
      );

      await expect(
        controller.create(upperCaseDto, mockRequest as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed unit ID', async () => {
      service.findOne.mockRejectedValue(
        new BadRequestException('Invalid unit ID format'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service unavailable', async () => {
      service.findAll.mockRejectedValue(
        new InternalServerErrorException('Service temporarily unavailable'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle concurrent updates', async () => {
      service.update.mockRejectedValue(
        new ConflictException('Unit was modified by another user'),
      );

      await expect(
        controller.update('unit-123', mockUpdateDto, mockRequest as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle null or undefined values', async () => {
      const nullDto = {
        name: 'Test Unit',
        id: undefined,
        createdByUserId: undefined,
      };

      const unitWithUndefinedFields = {
        ...mockUnitEntity,
        name: 'Test Unit',
      };
      const responseWithUndefinedFields = {
        ...mockUnitResponse,
        name: 'Test Unit',
      };
      service.create.mockResolvedValue(unitWithUndefinedFields);
      service.mapToResponseDto.mockReturnValue(responseWithUndefinedFields);

      const result = await controller.create(nullDto, mockRequest as any);

      expect(result.name).toBe('Test Unit');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete unit lifecycle', async () => {
      const unitId = 'unit-123';

      // Create
      service.create.mockResolvedValue(mockUnitEntity);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);
      const created = await controller.create(
        mockCreateDto,
        mockRequest as any,
      );
      expect(created).toEqual(mockUnitResponse);

      // Read
      service.findOne.mockResolvedValue(mockUnitEntity);
      const found = await controller.findOne(unitId);
      expect(found).toEqual(mockUnitResponse);

      // Update
      const updatedEntity = { ...mockUnitEntity, ...mockUpdateDto };
      const updatedResponse = { ...mockUnitResponse, ...mockUpdateDto };
      service.update.mockResolvedValue(updatedEntity);
      service.mapToResponseDto.mockReturnValue(updatedResponse);
      const updated = await controller.update(
        unitId,
        mockUpdateDto,
        mockRequest as any,
      );
      expect(updated).toEqual(updatedResponse);

      // Delete
      const removeResponse = {
        message: '✅ Unit với ID "unit-123" đã được xóa mềm',
        data: null,
      };
      service.remove.mockResolvedValue(removeResponse);
      const removed = await controller.remove(unitId, mockRequest as any);
      expect(removed).toEqual({ message: 'Xóa thành công' });

      // Restore
      service.restore.mockResolvedValue(mockUnitEntity);
      service.mapToResponseDto.mockReturnValue(mockUnitResponse);
      const restored = await controller.restore(unitId, mockRequest as any);
      expect(restored).toEqual(mockUnitResponse);
    });

    it('should handle multiple units', async () => {
      const multipleUnits = [
        mockUnitEntity,
        { ...mockUnitEntity, id: 'unit-2', name: 'Gram' },
        { ...mockUnitEntity, id: 'unit-3', name: 'Liter' },
      ];

      const multipleResponses = [
        mockUnitResponse,
        { ...mockUnitResponse, id: 'unit-2', name: 'Gram' },
        { ...mockUnitResponse, id: 'unit-3', name: 'Liter' },
      ];

      service.findAll.mockResolvedValue(multipleUnits);
      service.mapToResponseDto
        .mockReturnValueOnce(multipleResponses[0])
        .mockReturnValueOnce(multipleResponses[1])
        .mockReturnValueOnce(multipleResponses[2]);

      const result = await controller.findAll();

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleResponses);
    });

    it('should handle common unit types', async () => {
      const commonUnits = [
        { name: 'Kilogram', id: 'kg' },
        { name: 'Gram', id: 'g' },
        { name: 'Liter', id: 'l' },
        { name: 'Milliliter', id: 'ml' },
        { name: 'Piece', id: 'pcs' },
        { name: 'Box', id: 'box' },
      ];

      for (const unit of commonUnits) {
        const unitDto = { ...mockCreateDto, ...unit };
        const unitEntity = { ...mockUnitEntity, ...unit };
        const unitResponse = { ...mockUnitResponse, ...unit };

        service.create.mockResolvedValue(unitEntity);
        service.mapToResponseDto.mockReturnValue(unitResponse);

        const result = await controller.create(unitDto, mockRequest as any);
        expect(result.name).toBe(unit.name);
        expect(result.id).toBe(unit.id);
      }

      expect(service.create).toHaveBeenCalledTimes(commonUnits.length);
    });
  });
});
