import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './service/users.service';
import { User } from 'src/entities/global/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'globalConnection')],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
