import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create({
      ...createUserDto,
      passwordHash: createUserDto.password,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
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
      contactPhone
    });
  }
}