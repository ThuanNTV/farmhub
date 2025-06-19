import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GlobalDatabaseModule } from 'src/config/global-database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/global/user.entity';

@Module({
  imports: [
    GlobalDatabaseModule, // Uncomment if you need to use a global database connection
    TypeOrmModule.forFeature([User], 'globalConnection'), // Uncomment if you have a User entity
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
