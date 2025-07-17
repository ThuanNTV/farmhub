import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { JobScheduleStatus } from '../../../entities/tenant/job_schedule.entity';

export class CreateJobScheduleDto {
  @ApiProperty({ description: 'Store ID' })
  @IsUUID()
  storeId!: string;

  @ApiProperty({ description: 'Job name' })
  @IsString()
  jobName!: string;

  @ApiProperty({ description: 'Schedule (cron expression)' })
  @IsString()
  schedule!: string;

  @ApiProperty({ description: 'Last run at', required: false })
  @IsDateString()
  @IsOptional()
  lastRunAt?: string;

  @ApiProperty({ description: 'Next run at', required: false })
  @IsDateString()
  @IsOptional()
  nextRunAt?: string;

  @ApiProperty({
    description: 'Status',
    enum: JobScheduleStatus,
    default: JobScheduleStatus.SCHEDULED,
  })
  @IsEnum(JobScheduleStatus)
  @IsOptional()
  status?: JobScheduleStatus;

  @ApiProperty({ description: 'Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsUUID()
  createdByUserId!: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @IsUUID()
  @IsOptional()
  updatedByUserId?: string;
}
