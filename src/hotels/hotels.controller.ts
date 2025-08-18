import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelRoomsService } from './hotel-rooms.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel-room.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { type SearchHotelParams } from './interfaces/search-hotel-params.interface';
import { type SearchRoomsParams } from './interfaces/search-rooms-params.interface';
import { UpdateHotelParams } from './interfaces/update-hotel-params.interface';
import { Types } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Public } from '../users/decorators/public.decorator';
import { AuthenticatedGuard } from '../auth/session.serializer';
import { plainToInstance } from 'class-transformer';
import { HotelResponseDto } from './dto/hotel-response.dto';


@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelRoomsService: HotelRoomsService,
  ) {
  }

  @Post()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createHotelDto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(createHotelDto);
    return plainToInstance(HotelResponseDto, {
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
      createdAt: hotel.createdAt,
      updatedAt: hotel.updatedAt,
    });
  }

  @Public()
  @Get()
  async search(@Query() params: SearchHotelParams) {
    return this.hotelsService.search(params);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hotelsService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    const updateParams: UpdateHotelParams = {};

    if (updateHotelDto.title !== undefined) {
      updateParams.title = updateHotelDto.title;
    }

    if (updateHotelDto.description !== undefined) {
      updateParams.description = updateHotelDto.description;
    }

    return this.hotelsService.update(id, updateParams);
  }

  @Post(':id/rooms')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images'))
  async createRoom(
    @Param('id') hotelId: string,
    @Body() createRoomDto: CreateHotelRoomDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const imagePaths = images?.map((file) => file.path) || [];
    return this.hotelRoomsService.create({
      ...createRoomDto,
      hotel: new Types.ObjectId(hotelId),
      images: imagePaths,
    });
  }

  @Public()
  @Get(':id/rooms')
  async searchRooms(
    @Param('id') hotelId: string,
    @Query() params: Omit<SearchRoomsParams, 'hotel'>,
  ) {
    return this.hotelRoomsService.search({
      ...params,
      hotel: hotelId,
    });
  }

  @Put('rooms/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateHotelRoomDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const updateData: any = { ...updateRoomDto };
    if (images && images.length) {
      updateData.images = images.map((file) => file.path);
    }
    if (updateRoomDto.hotelId) {
      updateData.hotel = new Types.ObjectId(updateRoomDto.hotelId);
    }
    return this.hotelRoomsService.update(id, updateData);
  }
}