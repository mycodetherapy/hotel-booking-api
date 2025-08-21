import { PassportSerializer } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, id: string) => void) {
    done(null, user._id.toString());
  }

  async deserializeUser(id: string, done: (err: Error | null, user: any) => void) {
    try {
      const user = await this.usersService.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) {
      throw new UnauthorizedException('Unauthorized');
    }
    return true;
  }
}