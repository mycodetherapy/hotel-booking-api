import { Body, Controller, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
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

@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly hotelRoomsService: HotelRoomsService,
  ) {
  }

  @Post()
  async create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Get()
  async search(@Query() params: SearchHotelParams) {
    return this.hotelsService.search(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hotelsService.findById(id);
  }

  @Put(':id')
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