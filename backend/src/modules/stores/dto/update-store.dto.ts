import { PartialType } from '@nestjs/swagger';
import { CreateStoreDto } from 'src/modules/stores/dto/create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
