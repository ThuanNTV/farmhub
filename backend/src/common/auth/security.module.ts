import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SecurityService } from 'src/service/global/security.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
