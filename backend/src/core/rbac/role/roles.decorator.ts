import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/modules/users/dto/create-user.dto';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
