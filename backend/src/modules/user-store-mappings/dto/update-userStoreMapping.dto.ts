import { PartialType } from '@nestjs/swagger';
import { CreateUserStoreMappingDto } from './create-userStoreMapping.dto';

export class UpdateUserStoreMappingDto extends PartialType(
  CreateUserStoreMappingDto,
) {}
