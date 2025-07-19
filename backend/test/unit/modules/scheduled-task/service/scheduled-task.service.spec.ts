import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ScheduledTaskService } from 'src/modules/scheduled-task/service/scheduled-task.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ScheduledTask } from 'src/entities/tenant/scheduled_task.entity';

describe('ScheduledTaskService', () => {
  let service: ScheduledTaskService;
  let mockTenantDataSourceService: jest.Mocked<TenantDataSourceService>;
  let mockRepository: any;

  const mockTask: ScheduledTask = {
    id: 'task-001',
    name: 'Test Task',
    cron: '0 0 * * *',
    active: true,
    is_deleted: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const storeId = 'store-001';

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      })),
    };

    mockTenantDataSourceService = {
      getTenantDataSource: jest.fn().mockResolvedValue({
        getRepository: jest.fn().mockReturnValue(mockRepository),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduledTaskService,
        {
          provide: TenantDataSourceService,
          useValue: mockTenantDataSourceService,
        },
      ],
    }).compile();

    service = module.get<ScheduledTaskService>(ScheduledTaskService);

    // Mock the private getRepo method
    jest.spyOn(service as any, 'getRepo').mockResolvedValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all tasks ordered by created_at DESC', async () => {
      const mockTasks = [mockTask];
      mockRepository.find.mockResolvedValue(mockTasks);

      const result = await service.getAll(storeId);

      expect(result).toEqual(mockTasks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('create', () => {
    const createData = {
      name: 'New Task',
      cron: '0 0 * * *',
    };

    it('should create a new task successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // No existing task
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(storeId, createData);

      expect(result).toEqual(mockTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: createData.name },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        active: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });

    it('should throw BadRequestException if name is missing', async () => {
      const invalidData = { cron: '0 0 * * *' };

      await expect(service.create(storeId, invalidData)).rejects.toThrow(
        new BadRequestException('Name and cron are required'),
      );
    });

    it('should throw BadRequestException if cron is missing', async () => {
      const invalidData = { name: 'Test Task' };

      await expect(service.create(storeId, invalidData)).rejects.toThrow(
        new BadRequestException('Name and cron are required'),
      );
    });

    it('should throw BadRequestException if task name already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask); // Existing task

      await expect(service.create(storeId, createData)).rejects.toThrow(
        new BadRequestException('Task with name "New Task" already exists'),
      );
    });

    it('should throw BadRequestException for invalid cron expression', async () => {
      const invalidCronData = {
        name: 'Test Task',
        cron: 'invalid-cron',
      };

      await expect(service.create(storeId, invalidCronData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set active to true by default', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      await service.create(storeId, createData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        active: true,
      });
    });

    it('should respect provided active value', async () => {
      const dataWithActive = { ...createData, active: false };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      await service.create(storeId, dataWithActive);

      expect(mockRepository.create).toHaveBeenCalledWith(dataWithActive);
    });
  });

  describe('getTask', () => {
    const taskId = 'task-001';

    it('should return task successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTask(storeId, taskId);

      expect(result).toEqual({
        status: 'success',
        task: mockTask,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('should throw BadRequestException if taskId is empty', async () => {
      await expect(service.getTask(storeId, '')).rejects.toThrow(
        new BadRequestException('Task ID is required'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getTask(storeId, taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
    });
  });

  describe('updateTask', () => {
    const taskId = 'task-001';
    const updateData = {
      name: 'Updated Task',
      cron: '0 1 * * *',
    };

    it('should update task successfully', async () => {
      const updatedTask = { ...mockTask, ...updateData };
      mockRepository.findOne
        .mockResolvedValueOnce(mockTask) // First call for finding task
        .mockResolvedValueOnce(null); // Second call for checking duplicate name
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.updateTask(storeId, taskId, updateData);

      expect(result).toEqual({
        status: 'success',
        message: 'Task updated successfully',
        task: updatedTask,
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        ...updateData,
      });
    });

    it('should throw BadRequestException if taskId is empty', async () => {
      await expect(service.updateTask(storeId, '', updateData)).rejects.toThrow(
        new BadRequestException('Task ID is required'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTask(storeId, taskId, updateData),
      ).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
    });

    it('should throw BadRequestException for invalid cron expression', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      const invalidUpdateData = { cron: 'invalid-cron' };

      await expect(
        service.updateTask(storeId, taskId, invalidUpdateData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new name already exists', async () => {
      // Reset mock to ensure clean state
      mockRepository.findOne.mockReset();

      // Ensure updateData.name is different from mockTask.name
      const updateDataWithDifferentName = {
        name: 'Different Task Name', // Different from mockTask.name which is 'Test Task'
        cron: '0 1 * * *',
      };

      const existingTask = {
        ...mockTask,
        id: 'other-task',
        name: 'Different Task Name', // Same as updateData.name
      };

      // Mock the first call to find the task being updated
      mockRepository.findOne.mockResolvedValueOnce(mockTask);
      // Mock the second call to check for duplicate name
      mockRepository.findOne.mockResolvedValueOnce(existingTask);

      await expect(
        service.updateTask(storeId, taskId, updateDataWithDifferentName),
      ).rejects.toThrow(
        new BadRequestException(
          'Task with name "Different Task Name" already exists',
        ),
      );

      // Verify the calls were made correctly
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should allow updating with same name', async () => {
      const sameNameData = { name: mockTask.name };
      const updatedTask = { ...mockTask, ...sameNameData };
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.updateTask(storeId, taskId, sameNameData);

      expect(result.status).toBe('success');
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1); // Only called once to find the task
    });
  });

  describe('removeTask', () => {
    const taskId = 'task-001';

    it('should remove task successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      const result = await service.removeTask(storeId, taskId);

      expect(result).toEqual({
        status: 'success',
        message: 'Task deleted successfully',
        id: taskId,
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw BadRequestException if taskId is empty', async () => {
      await expect(service.removeTask(storeId, '')).rejects.toThrow(
        new BadRequestException('Task ID is required'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeTask(storeId, taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
    });
  });

  describe('toggleTaskStatus', () => {
    const taskId = 'task-001';

    it('should toggle task status from active to inactive', async () => {
      const activeTask = { ...mockTask, active: true };
      const inactiveTask = { ...mockTask, active: false };
      mockRepository.findOne.mockResolvedValue(activeTask);
      mockRepository.save.mockResolvedValue(inactiveTask);

      const result = await service.toggleTaskStatus(storeId, taskId);

      expect(result).toEqual({
        status: 'success',
        message: 'Task deactivated successfully',
        task: inactiveTask,
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...activeTask,
        active: false,
      });
    });

    it('should toggle task status from inactive to active', async () => {
      const inactiveTask = { ...mockTask, active: false };
      const activeTask = { ...mockTask, active: true };
      mockRepository.findOne.mockResolvedValue(inactiveTask);
      mockRepository.save.mockResolvedValue(activeTask);

      const result = await service.toggleTaskStatus(storeId, taskId);

      expect(result).toEqual({
        status: 'success',
        message: 'Task activated successfully',
        task: activeTask,
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...inactiveTask,
        active: true,
      });
    });

    it('should throw BadRequestException if taskId is empty', async () => {
      await expect(service.toggleTaskStatus(storeId, '')).rejects.toThrow(
        new BadRequestException('Task ID is required'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.toggleTaskStatus(storeId, taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
    });
  });

  describe('executeTask', () => {
    const taskId = 'task-001';

    it('should execute active task successfully', async () => {
      const activeTask = { ...mockTask, active: true };
      mockRepository.findOne.mockResolvedValue(activeTask);

      const result = await service.executeTask(storeId, taskId);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Task executed successfully');
      expect(result.result).toEqual({
        task_id: taskId,
        task_name: activeTask.name,
        execution_time: expect.any(Date),
        status: 'completed',
        message: `Task "${activeTask.name}" executed successfully`,
      });
    });

    it('should throw BadRequestException if taskId is empty', async () => {
      await expect(service.executeTask(storeId, '')).rejects.toThrow(
        new BadRequestException('Task ID is required'),
      );
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.executeTask(storeId, taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
    });

    it('should throw BadRequestException if task is inactive', async () => {
      const inactiveTask = { ...mockTask, active: false };
      mockRepository.findOne.mockResolvedValue(inactiveTask);

      await expect(service.executeTask(storeId, taskId)).rejects.toThrow(
        new BadRequestException('Cannot execute inactive task'),
      );
    });
  });

  describe('getTaskStats', () => {
    it('should return task statistics', async () => {
      const mockStats = {
        total_tasks: '5',
        active_tasks: '3',
        inactive_tasks: '2',
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTaskStats(storeId);

      expect(result).toEqual({
        total_tasks: 5,
        active_tasks: 3,
        inactive_tasks: 2,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'COUNT(*) as total_tasks',
        'SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as active_tasks',
        'SUM(CASE WHEN active = false THEN 1 ELSE 0 END) as inactive_tasks',
      ]);
    });

    it('should return zero stats when no data', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTaskStats(storeId);

      expect(result).toEqual({
        total_tasks: 0,
        active_tasks: 0,
        inactive_tasks: 0,
      });
    });
  });

  describe('validateCronExpression', () => {
    it('should validate correct cron expressions', () => {
      const validCronExpressions = [
        '0 0 * * *', // Daily at midnight
        '0 12 * * 1', // Every Monday at noon
        '15 * * * *', // Every hour at 15 minutes
        '0 9-17 * * 1-5', // Business hours weekdays
        '0 0 1 * *', // First day of month
        '0 0 * * 0,6', // Weekends
      ];

      validCronExpressions.forEach((cron) => {
        expect(() =>
          (service as any).validateCronExpression(cron),
        ).not.toThrow();
      });
    });

    it('should throw BadRequestException for invalid cron format', () => {
      const invalidCronExpressions = [
        '0 0 * *', // Too few parts
        '0 0 * * * *', // Too many parts
        'invalid', // Not a cron expression
        '', // Empty string
      ];

      invalidCronExpressions.forEach((cron) => {
        expect(() => (service as any).validateCronExpression(cron)).toThrow(
          new BadRequestException(
            'Invalid cron expression format. Expected 5 parts: minute hour day month weekday',
          ),
        );
      });
    });

    it('should throw BadRequestException for invalid minute values', () => {
      expect(() =>
        (service as any).validateCronExpression('60 0 * * *'),
      ).toThrow(
        new BadRequestException('Invalid minute value in cron expression'),
      );
      expect(() =>
        (service as any).validateCronExpression('-1 0 * * *'),
      ).toThrow(
        new BadRequestException('Invalid minute value in cron expression'),
      );
    });

    it('should throw BadRequestException for invalid hour values', () => {
      expect(() =>
        (service as any).validateCronExpression('0 24 * * *'),
      ).toThrow(
        new BadRequestException('Invalid hour value in cron expression'),
      );
      expect(() =>
        (service as any).validateCronExpression('0 -1 * * *'),
      ).toThrow(
        new BadRequestException('Invalid hour value in cron expression'),
      );
    });

    it('should throw BadRequestException for invalid day values', () => {
      const invalidDayCrons = [
        '0 0 32 * *', // Day > 31
        '0 0 0 * *', // Day < 1
        '0 0 abc * *', // Non-numeric
      ];

      invalidDayCrons.forEach((cron) => {
        expect(() => (service as any).validateCronExpression(cron)).toThrow(
          new BadRequestException('Invalid day value in cron expression'),
        );
      });
    });

    it('should throw BadRequestException for invalid month values', () => {
      const invalidMonthCrons = [
        '0 0 * 13 *', // Month > 12
        '0 0 * 0 *', // Month < 1
        '0 0 * abc *', // Non-numeric
      ];

      invalidMonthCrons.forEach((cron) => {
        expect(() => (service as any).validateCronExpression(cron)).toThrow(
          new BadRequestException('Invalid month value in cron expression'),
        );
      });
    });

    it('should throw BadRequestException for invalid weekday values', () => {
      expect(() =>
        (service as any).validateCronExpression('0 0 * * 8'),
      ).toThrow(
        new BadRequestException('Invalid weekday value in cron expression'),
      );
      expect(() =>
        (service as any).validateCronExpression('0 0 * * -1'),
      ).toThrow(
        new BadRequestException('Invalid weekday value in cron expression'),
      );
    });
  });

  describe('isValidCronField', () => {
    it('should accept wildcard (*) and question mark (?)', () => {
      expect((service as any).isValidCronField('*', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('?', 0, 59)).toBe(true);
    });

    it('should validate single numbers', () => {
      // Test valid values
      expect((service as any).isValidCronField('30', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('0', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('59', 0, 59)).toBe(true);

      // Test boundary values - these should fail
      expect((service as any).isValidCronField('60', 0, 59)).toBe(false);
      expect((service as any).isValidCronField('-1', 0, 59)).toBe(false);
    });

    it('should validate ranges', () => {
      expect((service as any).isValidCronField('1-5', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('0-59', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('5-1', 0, 59)).toBe(false); // Invalid range
      expect((service as any).isValidCronField('1-60', 0, 59)).toBe(false); // Out of range
    });

    it('should validate lists', () => {
      expect((service as any).isValidCronField('1,3,5', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('0,30,59', 0, 59)).toBe(true);
      expect((service as any).isValidCronField('1,60', 0, 59)).toBe(false); // Out of range
    });
  });

  describe('private getRepo method', () => {
    it('should throw error if storeId is empty', async () => {
      // Reset the spy to test the actual method
      jest.restoreAllMocks();

      await expect((service as any).getRepo('')).rejects.toThrow(
        'storeId is required',
      );
    });

    it('should return repository for valid storeId', async () => {
      // Reset the spy to test the actual method
      jest.restoreAllMocks();

      const result = await (service as any).getRepo(storeId);

      expect(result).toBe(mockRepository);
      expect(
        mockTenantDataSourceService.getTenantDataSource,
      ).toHaveBeenCalledWith(storeId);
    });
  });
});
