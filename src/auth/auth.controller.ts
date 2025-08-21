import { Controller, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
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
        const { email, name, contactPhone } = req.user;
        resolve({ email, name, contactPhone });
      });
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(new UnauthorizedException('Could not log out.'));
        }

        if (req.session) {
          req.session.destroy((destroyErr) => {
            if (destroyErr) {
              return reject(new UnauthorizedException('Could not destroy session.'));
            }
            resolve({});
          });
        } else {
          resolve({});
        }
      });
    });
  }
}