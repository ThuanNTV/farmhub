import { PartialType } from '@nestjs/swagger';
import { CreateJobScheduleDto } from 'src/modules/job-schedules/dto/create-jobSchedule.dto';

export class UpdateJobScheduleDto extends PartialType(CreateJobScheduleDto) {}
