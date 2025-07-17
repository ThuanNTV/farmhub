import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { JobScheduleStatus } from '../../../entities/tenant/job_schedule.entity';

export class JobScheduleResponseDto {
  @ApiProperty({ description: 'Job schedule ID' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'Store ID' })
  @Expose({ name: 'storeId' })
  storeId!: string;

  @ApiProperty({ description: 'Job name' })
  @Expose({ name: 'jobName' })
  jobName!: string;

  @ApiProperty({ description: 'Schedule (cron expression)' })
  @Expose()
  schedule!: string;

  @ApiProperty({ description: 'Last run at', required: false })
  @Expose({ name: 'lastRunAt' })
  lastRunAt?: Date;

  @ApiProperty({ description: 'Next run at', required: false })
  @Expose({ name: 'nextRunAt' })
  nextRunAt?: Date;

  @ApiProperty({ description: 'Status', enum: JobScheduleStatus })
  @Expose()
  status!: JobScheduleStatus;

  @ApiProperty({ description: 'Note', required: false })
  @Expose()
  note?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose({ name: 'createdAt' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose({ name: 'updatedAt' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Created by user ID' })
  @Exclude()
  createdByUserId!: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @Exclude()
  updatedByUserId?: string;
}
