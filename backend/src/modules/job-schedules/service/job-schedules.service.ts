import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { JobSchedule } from 'src/entities/tenant/job_schedule.entity';
import { CreateJobScheduleDto } from 'src/modules/job-schedules/dto/create-jobSchedule.dto';
import { UpdateJobScheduleDto } from 'src/modules/job-schedules/dto/update-jobSchedule.dto';
import { JobScheduleResponseDto } from 'src/modules/job-schedules/dto/jobSchedule-response.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';

@Injectable()
export class JobSchedulesService extends TenantBaseService<JobSchedule> {
  protected readonly logger = new Logger(JobSchedulesService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, JobSchedule);
    this.primaryKey = 'id';
  }

  async createJobSchedule(
    storeId: string,
    dto: CreateJobScheduleDto,
  ): Promise<JobScheduleResponseDto> {
    try {
      this.logger.log(`Creating job schedule for store: ${storeId}`);

      // Validate cron expression
      if (!this.isValidCronExpression(dto.schedule)) {
        throw new BadRequestException('Invalid cron expression format');
      }

      const entityData = DtoMapper.mapToEntity<JobSchedule>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`Job schedule created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findJobScheduleById(
    storeId: string,
    id: string,
  ): Promise<JobScheduleResponseDto | null> {
    try {
      this.logger.debug(
        `Finding job schedule by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`Job schedule not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findOne(storeId: string, id: string): Promise<JobScheduleResponseDto> {
    try {
      this.logger.debug(
        `Finding job schedule by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(`Job schedule with ID "${id}" not found`);
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllJobSchedules(
    storeId: string,
  ): Promise<JobScheduleResponseDto[]> {
    try {
      this.logger.debug(`Finding all job schedules for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} job schedules`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find job schedules: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updateJobSchedule(
    storeId: string,
    id: string,
    dto: UpdateJobScheduleDto,
  ): Promise<JobScheduleResponseDto> {
    try {
      this.logger.log(`Updating job schedule: ${id} in store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Job schedule with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Validate cron expression if provided
      if (dto.schedule && !this.isValidCronExpression(dto.schedule)) {
        throw new BadRequestException('Invalid cron expression format');
      }

      const entityData = DtoMapper.mapToEntity<JobSchedule>(
        dto as unknown as Record<string, unknown>,
      );

      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`Job schedule updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removeJobSchedule(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(`Removing job schedule: ${id} from store: ${storeId}`);

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(`Job schedule with ID "${id}" not found`);
      }
      const repo = await this.getRepo(storeId);

      // Soft delete
      entity.is_deleted = true;
      await repo.save(entity);

      this.logger.log(`Job schedule soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async restoreJobSchedule(
    storeId: string,
    id: string,
  ): Promise<JobScheduleResponseDto> {
    try {
      this.logger.log(`Restoring job schedule: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entity = await repo.findOne({
        where: { id, is_deleted: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Job schedule with ID "${id}" not found or not deleted`,
        );
      }

      entity.is_deleted = false;
      entity.deleted_at = undefined;
      const restored = await repo.save(entity);

      this.logger.log(`Job schedule restored successfully: ${id}`);

      return this.mapToResponseDto(restored);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to restore job schedule: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  private mapToResponseDto(entity: JobSchedule): JobScheduleResponseDto {
    return {
      id: entity.id,
      storeId: entity.store_id,
      jobName: entity.job_name,
      schedule: entity.schedule,
      lastRunAt: entity.last_run_at,
      nextRunAt: entity.next_run_at,
      status: entity.status,
      note: entity.note,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      createdByUserId: entity.created_by_user_id,
      updatedByUserId: entity.updated_by_user_id,
    };
  }

  private isValidCronExpression(cron: string): boolean {
    // Basic cron validation: 5 or 6 fields
    const cronRegex =
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))(\s.*)?$/;
    return cronRegex.test(cron);
  }
}
