import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from '../../../../../src/modules/audit-logs/controller/audit-logs.controller';
import { AuditLogsService } from '../../../../../src/modules/audit-logs/service/audit-logs.service';
import { CreateAuditLogDto } from '../../../../../src/modules/audit-logs/dto/create-auditLog.dto';
import { UpdateAuditLogDto } from '../../../../../src/modules/audit-logs/dto/update-auditLog.dto';
import { AuditLogResponseDto } from '@modules/audit-logs/dto/audit-log-response.dto';

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
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Test Product', price: 100 },
    },
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
    storeId: 'store-123', // Added missing property
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Test Product', price: 100 },
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    isDeleted: false,
    deletedAt: undefined,
  };

  const mockCreateDto: CreateAuditLogDto = {
    userId: 'user-123',
    action: 'CREATE',
    targetTable: 'products',
    targetId: 'product-123',
    storeId: 'store-123', // Added missing property
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Test Product', price: 100 },
    },
  };

  const mockUpdateDto: UpdateAuditLogDto = {
    action: 'UPDATE',
    metadata: {
      action: 'UPDATE',
      resource: 'products',
      resourceId: 'product-123',
      changes: { name: 'Updated Product', price: 150 },
    },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      mapToResponseDto: jest.fn(),
      findWithFilters: jest.fn(),
      getStatistics: jest.fn(),
      getChangeHistory: jest.fn(),
    };

    // Create controller instance directly to avoid guard/interceptor issues
    service = mockService as any;
    controller = new AuditLogsController(service as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log successfully', async () => {
      service.create.mockResolvedValue(mockAuditLog as any);
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

      service.findAll.mockResolvedValue(mockAuditLogs as any);
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
      service.findOne.mockResolvedValue(mockAuditLog as any);
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

      service.update.mockResolvedValue(updatedAuditLog as any);
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

      service.findAll.mockResolvedValue(mockAuditLogs as any);
      service.mapToResponseDto
        .mockReturnValueOnce(mockResponses[0])
        .mockReturnValueOnce(mockResponses[1]);

      const result = await controller.findAll('store-123');

      expect(service.mapToResponseDto).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponses);
    });
  });

  describe('searchLogs', () => {
    it('should search audit logs with filters', async () => {
      const filters = {
        userId: 'user1',
        action: 'CREATE',
        page: 1,
        limit: 10,
      };
      const paginatedResult = {
        data: [mockAuditLogResponse],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        appliedFilters: {
          userId: 'user1',
          action: 'CREATE',
        },
        generatedAt: new Date(),
      };

      service.findWithFilters.mockResolvedValue(paginatedResult);

      const result = await controller.searchLogs('store1', filters as any);

      expect(result).toEqual(paginatedResult);
      expect(service.findWithFilters).toHaveBeenCalledWith('store1', filters);
    });

    it('should handle service errors during search', async () => {
      const filters = { page: 1, limit: 10 };
      service.findWithFilters.mockRejectedValue(new Error('Search failed'));

      await expect(
        controller.searchLogs('store1', filters as any),
      ).rejects.toThrow('Search failed');
    });
  });

  describe('getStatistics', () => {
    it('should get audit log statistics', async () => {
      const dateRange = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };
      const stats = {
        totalLogs: 100,
        logsByAction: { CREATE: 50, UPDATE: 30, DELETE: 20 },
        logsByUser: { user1: 60, user2: 40 },
        logsByTable: { products: 70, users: 30 },
        logsByDevice: { desktop: 80, mobile: 20 },
        logsByBrowser: { chrome: 60, firefox: 40 },
        recentActivity: [
          {
            action: 'CREATE',
            targetTable: 'products',
            userName: 'John Doe',
            createdAt: new Date('2023-01-01'),
            count: 5,
          },
        ],
        dailyStats: [{ date: '2023-01-01', count: 10 }],
        topActiveUsers: [
          {
            userId: 'user-1',
            userName: 'John Doe',
            actionCount: 50,
            lastActivity: new Date('2023-01-01'),
          },
        ],
        generatedAt: new Date('2023-01-01'),
      };

      service.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics('store1', dateRange as any);

      expect(result).toEqual(stats);
      expect(service.getStatistics).toHaveBeenCalledWith('store1', dateRange);
    });

    it('should handle service errors during statistics', async () => {
      service.getStatistics.mockRejectedValue(new Error('Stats failed'));

      await expect(controller.getStatistics('store1')).rejects.toThrow(
        'Stats failed',
      );
    });
  });

  describe('getChangeHistory', () => {
    it('should get change history for a record', async () => {
      const history = [mockAuditLogResponse];
      service.getChangeHistory.mockResolvedValue(history);

      const result = await controller.getChangeHistory(
        'store1',
        'products',
        'prod1',
      );

      expect(result).toEqual(history);
      expect(service.getChangeHistory).toHaveBeenCalledWith(
        'store1',
        'products',
        'prod1',
      );
    });

    it('should handle service errors during change history', async () => {
      service.getChangeHistory.mockRejectedValue(new Error('History failed'));

      await expect(
        controller.getChangeHistory('store1', 'products', 'prod1'),
      ).rejects.toThrow('History failed');
    });
  });
});
