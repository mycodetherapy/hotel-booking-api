import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { Public } from '../users/decorators/public.decorator';
import { AuthenticatedGuard } from '../auth/session.serializer';
import { plainToInstance } from 'class-transformer';
import { HotelResponseDto } from './dto/hotel-response.dto';


@Controller()
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelRoomsService: HotelRoomsService,
  ) {
  }

  @Post('admin/hotels')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createHotelDto: CreateHotelDto) {
    const hotel = await this.hotelsService.create(createHotelDto);
    return plainToInstance(HotelResponseDto, {
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    });
  }

  @Get('admin/hotels')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async search(@Query() params: SearchHotelParams) {
    const hotels = await this.hotelsService.search(params);
    return hotels.map(hotel => ({
      id: hotel._id.toString(),
      title: hotel.title,
      description: hotel.description,
    }));
  }

  @Put('admin/hotels/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    const hotel = await this.hotelsService.update(id, updateHotelDto);
    const updateParams: UpdateHotelParams = {};

    if (updateHotelDto.title !== undefined) {
      updateParams.title = updateHotelDto.title;
    }

    if (updateHotelDto.description !== undefined) {
      updateParams.description = updateHotelDto.description;
    }

    return {
      id: hotel?._id.toString(),
      title: updateHotelDto.title,
      description: updateHotelDto.description,
    };
  }

  @Public()
  @Get('common/hotel-rooms')
  async searchRooms(@Query() params: SearchRoomsParams, @Req() req) {
    if (!req.user || req.user.role === 'client') {
      params.isEnabled = true;
    }
    const rooms = await this.hotelRoomsService.search(params);
    return rooms.map(room => ({
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      hotel: {
        id: room.hotel._id.toString(),
        title: room.hotel.title,
      },
    }));
  }

  @Public()
  @Get('common/hotel-rooms/:id')
  async findRoom(@Param('id') id: string) {
    const room = await this.hotelRoomsService.findById(id);
    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      hotel: {
        id: room.hotel._id.toString(),
        title: room.hotel.title,
        description: room.hotel.description,
      },
    };
  }

  @Post('admin/hotel-rooms')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images'))
  async createRoom(
    @Body() createRoomDto: CreateHotelRoomDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const imagePaths = images?.map(file => file.path) || [];
    const room = await this.hotelRoomsService.create({
      ...createRoomDto,
      images: imagePaths,
    });
    return {
      id: room._id.toString(),
      description: room.description,
      images: room.images,
      isEnabled: room.isEnabled,
      hotel: {
        id: room.hotel._id.toString(),
        title: room.hotel.title,
        description: room.hotel.description,
      },
    };
  }

  @Put('admin/hotel-rooms/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateHotelRoomDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    const updateData: any = { ...updateRoomDto };
    if (images?.length) {
      updateData.images = images.map(file => file.path);
    }
    const room = await this.hotelRoomsService.update(id, updateData);
    return {
      id: room?._id.toString(),
      description: room?.description,
      images: room?.images,
      isEnabled: room?.isEnabled,
      hotel: {
        id: room?.hotel._id.toString(),
        title: room?.hotel.title,
        description: room?.hotel.description,
      },
    };
  }
}