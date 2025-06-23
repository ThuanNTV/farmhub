import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/auth/jwt.strategy';
import { LocalStrategy } from 'src/common/auth/local.strategy';
import { AuthController } from 'src/controller/auth.controller';
import { UsersModule } from 'src/module/users.module';
import { AuthService } from 'src/service/auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
