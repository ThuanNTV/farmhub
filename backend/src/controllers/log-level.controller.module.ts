import { Module } from '@nestjs/common';
import { LogLevelModule } from 'src/utils/log-level.module';
import { LogLevelController } from 'src/controllers/log-level.controller';
import { AuthModule } from 'src/core/auth/auth.module';

@Module({
  imports: [LogLevelModule, AuthModule],
  controllers: [LogLevelController],
})
export class LogLevelControllerModule {}
