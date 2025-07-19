import { PartialType } from '@nestjs/swagger';
import { CreateStoreSettingDto } from 'src/modules/store-settings/dto/create-storeSetting.dto';

export class UpdateStoreSettingDto extends PartialType(CreateStoreSettingDto) {}
