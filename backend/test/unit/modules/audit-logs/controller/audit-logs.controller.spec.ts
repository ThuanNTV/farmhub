import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from 'src/modules/audit-logs/controller/audit-logs.controller';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import { CreateAuditLogDto } from 'src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from 'src/modules/audit-logs/dto/update-auditLog.dto';
import { AuditLogResponseDto } from 'src/modules/audit-logs/dto/audit-log-response.dto';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let service: jest.Mocked<AuditLogsService>;

  // Mock data
  const mockAuditLog = {
    id: 'audit-123',
    user_id: 'user-123',
    action: 'CREATE',
    target_table: 'products',
    target_id: 'product-123',
    metadata: { name: 'Test Product', price: 100 },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
    is_deleted: false,
    deleted_at: null,
  };

  const mockAuditLogResponse: AuditLogResponseDto = {
    id: 'audit-123',
    userId: 'user-123',
    action: 'CREATE',
    targetTable: 'products',
    targetId: 'product-123',
    metadata: { name: 'Test Product', price: 100 },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    isDeleted: false,
    deletedAt: null,
  };

  const mockCreateDto: CreateAuditLogDto = {
    userId: 'user-123',
    action: 'CREATE',
    targetTable: 'products',
    targetId: 'product-123',
    metadata: { name: 'Test Product', price: 100 },
  };

  const mockUpdateDto: UpdateAuditLogDto = {
    action: 'UPDATE',
    metadata: { name: 'Updated Product', price: 150 },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      mapToResponseDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    service = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log successfully', async () => {
      service.create.mockResolvedValue(mockAuditLog);
      service.mapToResponseDto.mockReturnValue(mockAuditLogResponse);

      const result = await controller.create('store-123', mockCreateDto);

      expect(service.create).toHaveBeenCalledWith('store-123', mockCreateDto);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLogResponse);
    });

    it('should handle service errors during creation', async () => {
      const error = new Error('Database error');
      service.create.mockRejectedValue(error);

      await expect(
        controller.create('store-123', mockCreateDto),
      ).rejects.toThrow('Database error');
      expect(service.create).toHaveBeenCalledWith('store-123', mockCreateDto);
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      const mockAuditLogs = [mockAuditLog];
      const mockResponses = [mockAuditLogResponse];

      service.findAll.mockResolvedValue(mockAuditLogs);
      service.mapToResponseDto.mockReturnValue(mockAuditLogResponse);

      const result = await controller.findAll('store-123');

      expect(service.findAll).toHaveBeenCalledWith('store-123');
      expect(service.mapToResponseDto).toHaveBeenCalledTimes(1);
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockResponses);
    });

    it('should return empty array when no audit logs found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll('store-123');

      expect(service.findAll).toHaveBeenCalledWith('store-123');
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll('store-123')).rejects.toThrow(
        'Database connection error',
      );
      expect(service.findAll).toHaveBeenCalledWith('store-123');
    });
  });

  describe('findById', () => {
    it('should return audit log by id', async () => {
      service.findOne.mockResolvedValue(mockAuditLog);
      service.mapToResponseDto.mockReturnValue(mockAuditLogResponse);

      const result = await controller.findById('store-123', 'audit-123');

      expect(service.findOne).toHaveBeenCalledWith('store-123', 'audit-123');
      expect(service.mapToResponseDto).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLogResponse);
    });

    it('should handle service errors during findById', async () => {
      const error = new Error('Audit log not found');
      service.findOne.mockRejectedValue(error);

      await expect(
        controller.findById('store-123', 'nonexistent'),
      ).rejects.toThrow('Audit log not found');
      expect(service.findOne).toHaveBeenCalledWith('store-123', 'nonexistent');
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update audit log successfully', async () => {
      const updatedAuditLog = { ...mockAuditLog, action: 'UPDATE' };
      const updatedResponse = { ...mockAuditLogResponse, action: 'UPDATE' };

      service.update.mockResolvedValue(updatedAuditLog);
      service.mapToResponseDto.mockReturnValue(updatedResponse);

      const result = await controller.update(
        'store-123',
        'audit-123',
        mockUpdateDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'store-123',
        'audit-123',
        mockUpdateDto,
      );
      expect(service.mapToResponseDto).toHaveBeenCalledWith(updatedAuditLog);
      expect(result).toEqual(updatedResponse);
    });

    it('should handle service errors during update', async () => {
      const error = new Error('Update failed');
      service.update.mockRejectedValue(error);

      await expect(
        controller.update('store-123', 'audit-123', mockUpdateDto),
      ).rejects.toThrow('Update failed');
      expect(service.update).toHaveBeenCalledWith(
        'store-123',
        'audit-123',
        mockUpdateDto,
      );
      expect(service.mapToResponseDto).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove audit log successfully', async () => {
      const mockRemoveResponse = {
        message: '✅ AuditLog với ID "audit-123" đã được xóa',
        data: null,
      };

      service.remove.mockResolvedValue(mockRemoveResponse);

      const result = await controller.remove('store-123', 'audit-123');

      expect(service.remove).toHaveBeenCalledWith('store-123', 'audit-123');
      expect(result).toEqual(mockRemoveResponse);
    });

    it('should handle service errors during removal', async () => {
      const error = new Error('Removal failed');
      service.remove.mockRejectedValue(error);

      await expect(controller.remove('store-123', 'audit-123')).rejects.toThrow(
        'Removal failed',
      );
      expect(service.remove).toHaveBeenCalledWith('store-123', 'audit-123');
    });
  });

  describe('mapToResponseDto integration', () => {
    it('should properly map multiple audit logs', async () => {
      const mockAuditLogs = [
        mockAuditLog,
        { ...mockAuditLog, id: 'audit-456', action: 'DELETE' },
      ];
      const mockResponses = [
        mockAuditLogResponse,
        { ...mockAuditLogResponse, id: 'audit-456', action: 'DELETE' },
      ];

      service.findAll.mockResolvedValue(mockAuditLogs);
      service.mapToResponseDto
        .mockReturnValueOnce(mockResponses[0])
        .mockReturnValueOnce(mockResponses[1]);

      const result = await controller.findAll('store-123');

      expect(service.mapToResponseDto).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponses);
    });
  });
});
