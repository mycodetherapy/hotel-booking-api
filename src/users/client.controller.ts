import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { RegisterDto } from '../auth/dto/register.dto';


@Controller('api/client')
export class ClientController {
  constructor(private usersService: UsersService) {
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email уже занят');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: 'client',
    });

    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  }
}