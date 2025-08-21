import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { AuthenticatedGuard } from '../auth/session.serializer';
import type { SearchUserParams } from './interfaces/search-user-params.interface';


@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Post('client/register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }

  @Post('admin/users')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create({ ...dto, role: dto['role'] });
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
      role: user.role,
    };
  }

  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Get('admin/users')
  @Roles('admin')
  async getAdminUsers(@Query() query: SearchUserParams) {
    const users = await this.usersService.findAll(query);
    return users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      contactPhone: u.contactPhone,
    }));
  }

  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Get('manager/users')
  @Roles('manager')
  async getManagerUsers(@Query() query: SearchUserParams) {
    const users = await this.usersService.findAll(query);
    return users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      contactPhone: u.contactPhone,
    }));
  }
}