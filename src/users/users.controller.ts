import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create({
      ...createUserDto,
      passwordHash: createUserDto.password,
    });
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  @Roles('admin', 'manager')
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('email') email = '',
    @Query('name') name = '',
    @Query('contactPhone') contactPhone = '',
  ) {
    return this.usersService.findAll({
      limit: Number(limit),
      offset: Number(offset),
      email,
      name,
      contactPhone,
    });
  }
}