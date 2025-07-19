import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from 'src/modules/units/dto/create-unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
