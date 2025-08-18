import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';

import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/session.serializer';
import { Roles } from './decorators/roles.decorator';
import { UsersService } from './user.service';


@Controller('api/admin/users')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
      role: user.role,
    };
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('name') name = '',
    @Query('email') email = '',
    @Query('contactPhone') contactPhone = '',
  ) {
    const users = await this.usersService.findAll({
      limit: Number(limit),
      offset: Number(offset),
      email,
      name,
      contactPhone,
    });

    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
    }));
  }
}