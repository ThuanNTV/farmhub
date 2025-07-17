import { PartialType } from '@nestjs/swagger';
import { CreateJobScheduleDto } from './create-jobSchedule.dto';

export class UpdateJobScheduleDto extends PartialType(CreateJobScheduleDto) {}
