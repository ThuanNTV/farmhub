import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class ScheduledTaskResponseDto {
  @ApiProperty({ description: 'Task ID' })
  id?: string;

  @ApiProperty({ description: 'Task name' })
  name?: string;

  @ApiProperty({ description: 'Task description' })
  description?: string;

  @ApiProperty({ description: 'Cron expression for scheduling' })
  cronExpression?: string;

  @ApiProperty({ description: 'Task handler function name' })
  handlerFunction?: string;

  @ApiProperty({ description: 'Task parameters as JSON string' })
  parameters?: string;

  @ApiProperty({ description: 'Whether the task is active' })
  isActive?: boolean;

  @ApiProperty({ description: 'Next execution time' })
  nextExecutionAt?: Date;

  @ApiProperty({ description: 'Last execution time' })
  lastExecutionAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt?: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt?: Date;

  @Exclude()
  createdByUserId?: string;

  @Exclude()
  updatedByUserId?: string;

  @Exclude()
  isDeleted?: boolean;
}
