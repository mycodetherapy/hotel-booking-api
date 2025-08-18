import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../users/decorators/public.decorator';
import { AuthenticatedGuard } from './session.serializer';


@Controller('auth')
export class AuthController {
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return new Promise((resolve, reject) => {
      req.login(req.user, (err) => {
        if (err) {
          return reject(new UnauthorizedException());
        }
        const { passwordHash, ...result } = req.user;
        resolve(result);
      });
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req, @Session() session: Record<string, any>) {
    req.logout((err) => {
      if (err) {
        throw new UnauthorizedException('Could not log out.');
      }
    });
    session.destroy(null);
    return {};
  }
}