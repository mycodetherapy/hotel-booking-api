import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const userObj = user['toObject'] ? user['toObject']() : user;
      const { passwordHash, ...result } = userObj;

      return result;
    }
    return null;
  }
}