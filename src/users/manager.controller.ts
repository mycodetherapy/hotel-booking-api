import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/session.serializer';
import { UsersService } from './user.service';
import { Roles } from './decorators/roles.decorator';


@Controller('api/manager/users')
@UseGuards(AuthenticatedGuard, RolesGuard)
export class ManagerController {
  constructor(private readonly usersService: UsersService) {
  }

  @Get()
  @Roles('manager')
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