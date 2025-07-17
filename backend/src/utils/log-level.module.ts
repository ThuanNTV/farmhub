import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogLevelService } from './log-level.service';

@Module({
  imports: [ConfigModule],
  providers: [LogLevelService],
  exports: [LogLevelService],
})
export class LogLevelModule {}
