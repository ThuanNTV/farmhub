import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ScheduledTask } from 'src/entities/tenant/scheduled_task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduledTaskService {
  constructor(private readonly tenantDS: TenantDataSourceService) {}

  private async getRepo(storeId: string): Promise<Repository<ScheduledTask>> {
    if (!storeId) throw new Error('storeId is required');
    const ds = await this.tenantDS.getTenantDataSource(storeId);
    return ds.getRepository(ScheduledTask);
  }

  async getAll(storeId: string) {
    const repo = await this.getRepo(storeId);
    return await repo.find({
      order: { created_at: 'DESC' },
    });
  }

  async create(storeId: string, data: Partial<ScheduledTask>) {
    // Validate required fields
    if (!data.name || !data.cron) {
      throw new BadRequestException('Name and cron are required');
    }

    // Validate cron expression format
    this.validateCronExpression(data.cron);

    const repo = await this.getRepo(storeId);

    // Check for duplicate task names
    const existingTask = await repo.findOne({
      where: { name: data.name },
    });

    if (existingTask) {
      throw new BadRequestException(
        `Task with name "${data.name}" already exists`,
      );
    }

    const entity = repo.create({
      ...data,
      active: data.active ?? true,
    });

    return await repo.save(entity);
  }

  async getTask(storeId: string, taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const repo = await this.getRepo(storeId);
    const task = await repo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return {
      status: 'success',
      task,
    };
  }

  async updateTask(
    storeId: string,
    taskId: string,
    data: Partial<ScheduledTask>,
  ) {
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const repo = await this.getRepo(storeId);
    const task = await repo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Validate cron expression if provided
    if (data.cron) {
      this.validateCronExpression(data.cron);
    }

    // Check for duplicate task names if name is being updated
    if (data.name && data.name !== task.name) {
      const existingTask = await repo.findOne({
        where: { name: data.name },
      });

      if (existingTask) {
        throw new BadRequestException(
          `Task with name "${data.name}" already exists`,
        );
      }
    }

    Object.assign(task, data);
    const updatedTask = await repo.save(task);

    return {
      status: 'success',
      message: 'Task updated successfully',
      task: updatedTask,
    };
  }

  async removeTask(storeId: string, taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const repo = await this.getRepo(storeId);
    const task = await repo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Hard delete since entity doesn't have soft delete
    await repo.remove(task);

    return {
      status: 'success',
      message: 'Task deleted successfully',
      id: taskId,
    };
  }

  async toggleTaskStatus(storeId: string, taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const repo = await this.getRepo(storeId);
    const task = await repo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.active = !task.active;
    const updatedTask = await repo.save(task);

    return {
      status: 'success',
      message: `Task ${task.active ? 'activated' : 'deactivated'} successfully`,
      task: updatedTask,
    };
  }

  async executeTask(storeId: string, taskId: string) {
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const repo = await this.getRepo(storeId);
    const task = await repo.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (!task.active) {
      throw new BadRequestException('Cannot execute inactive task');
    }

    // Simulate task execution
    const result = {
      task_id: taskId,
      task_name: task.name,
      execution_time: new Date(),
      status: 'completed',
      message: `Task "${task.name}" executed successfully`,
    };

    return {
      status: 'success',
      message: 'Task executed successfully',
      result,
    };
  }

  async getTaskStats(storeId: string) {
    const repo = await this.getRepo(storeId);

    const stats = await repo
      .createQueryBuilder('task')
      .select([
        'COUNT(*) as total_tasks',
        'SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as active_tasks',
        'SUM(CASE WHEN active = false THEN 1 ELSE 0 END) as inactive_tasks',
      ])
      .getRawOne<{
        total_tasks: string;
        active_tasks: string;
        inactive_tasks: string;
      }>();

    return {
      total_tasks: stats ? parseInt(stats.total_tasks) || 0 : 0,
      active_tasks: stats ? parseInt(stats.active_tasks) || 0 : 0,
      inactive_tasks: stats ? parseInt(stats.inactive_tasks) || 0 : 0,
    };
  }

  private validateCronExpression(cronExpression: string): void {
    // Basic cron expression validation
    const cronParts = cronExpression.split(' ');
    if (cronParts.length !== 5) {
      throw new BadRequestException(
        'Invalid cron expression format. Expected 5 parts: minute hour day month weekday',
      );
    }

    // Validate each part
    const [minute, hour, day, month, weekday] = cronParts;

    // Minute: 0-59
    if (!this.isValidCronField(minute, 0, 59)) {
      throw new BadRequestException('Invalid minute value in cron expression');
    }

    // Hour: 0-23
    if (!this.isValidCronField(hour, 0, 23)) {
      throw new BadRequestException('Invalid hour value in cron expression');
    }

    // Day: 1-31
    if (!this.isValidCronField(day, 1, 31)) {
      throw new BadRequestException('Invalid day value in cron expression');
    }

    // Month: 1-12
    if (!this.isValidCronField(month, 1, 12)) {
      throw new BadRequestException('Invalid month value in cron expression');
    }

    // Weekday: 0-7 (0 and 7 both represent Sunday)
    if (!this.isValidCronField(weekday, 0, 7)) {
      throw new BadRequestException('Invalid weekday value in cron expression');
    }
  }

  private isValidCronField(field: string, min: number, max: number): boolean {
    if (field === '*' || field === '?') return true;

    // Handle ranges like 1-5
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return (
        !isNaN(start) &&
        !isNaN(end) &&
        start >= min &&
        end <= max &&
        start <= end
      );
    }

    // Handle lists like 1,3,5
    if (field.includes(',')) {
      return field.split(',').every((num) => {
        const val = Number(num);
        return !isNaN(val) && val >= min && val <= max;
      });
    }

    // Handle single numbers
    const val = Number(field);
    return !isNaN(val) && val >= min && val <= max;
  }

  private calculateNextRun(_: string): Date {
    // Simplified next run calculation
    // In a real implementation, use a cron library like node-cron
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setMinutes(now.getMinutes() + 1); // Default to next minute
    return nextRun;
  }
}
