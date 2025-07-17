import { PartialType } from '@nestjs/swagger';
import { CreateStoreSettingDto } from './create-storeSetting.dto';

export class UpdateStoreSettingDto extends PartialType(CreateStoreSettingDto) {}
