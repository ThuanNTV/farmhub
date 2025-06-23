import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/dto/dtoUsers/create-user.dto';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
