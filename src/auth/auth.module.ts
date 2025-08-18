import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
  ],
  exports: [AuthService],
})
export class AuthModule {
}