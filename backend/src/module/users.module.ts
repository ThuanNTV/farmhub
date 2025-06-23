import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { GlobalDatabaseModule } from 'src/config/db/dbtenant/global-database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/global/user.entity';
import { UsersController } from 'src/controller/users.controller';

@Module({
  imports: [
    GlobalDatabaseModule, // Uncomment if you need to use a global database connection
    TypeOrmModule.forFeature([User], 'globalConnection'), // Uncomment if you have a User entity
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
