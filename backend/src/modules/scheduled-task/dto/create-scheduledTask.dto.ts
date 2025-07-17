import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateScheduledTaskDto {
  @ApiProperty({ description: 'Task name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cron expression for scheduling' })
  @IsString()
  cronExpression!: string;

  @ApiProperty({ description: 'Task handler function name' })
  @IsString()
  handlerFunction!: string;

  @ApiProperty({
    description: 'Task parameters as JSON string',
    required: false,
  })
  @IsOptional()
  @IsString()
  parameters?: string;

  @ApiProperty({ description: 'Whether the task is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Next execution time', required: false })
  @IsOptional()
  @IsDateString()
  nextExecutionAt?: string;

  @ApiProperty({ description: 'Last execution time', required: false })
  @IsOptional()
  @IsDateString()
  lastExecutionAt?: string;
}
