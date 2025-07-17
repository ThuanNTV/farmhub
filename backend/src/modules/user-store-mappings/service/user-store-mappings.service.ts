import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStoreMapping } from 'src/entities/global/user_store_mapping.entity';
import { User } from 'src/entities/global/user.entity';
import { Store } from 'src/entities/global/store.entity';
import { CreateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/create-userStoreMapping.dto';
import { UpdateUserStoreMappingDto } from 'src/modules/user-store-mappings/dto/update-userStoreMapping.dto';
import { UserStoreMappingResponseDto } from 'src/modules/user-store-mappings/dto/userStoreMapping-response.dto';

@Injectable()
export class UserStoreMappingsService {
  constructor(
    @InjectRepository(UserStoreMapping, 'globalConnection')
    private userStoreMappingsRepo: Repository<UserStoreMapping>,
    @InjectRepository(User, 'globalConnection')
    private usersRepo: Repository<User>,
    @InjectRepository(Store, 'globalConnection')
    private storesRepo: Repository<Store>,
  ) {}

  // TODO: Giữ lại các hàm CRUD đặc thù nghiệp vụ nếu có, hoặc xóa file này nếu không còn logic riêng.
}
