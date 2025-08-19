import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelRoom } from './schemas/hotel-room.schema';
import { HotelRoomService } from './interfaces/hotel-room-service.interface';
import { SearchRoomsParams } from './interfaces/search-rooms-params.interface';
import { Hotel } from './schemas/hotel.schema';
import { CreateHotelRoomDto } from './dto/create-hotel-room.dto';

@Injectable()
export class HotelRoomsService implements HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoom>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<Hotel>,
  ) {
  }

  async create(data: CreateHotelRoomDto & { images?: string[] }) {
    const hotel = await this.hotelModel.findById(data.hotelId);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const room = new this.hotelRoomModel({
      hotel: hotel._id,
      description: data.description,
      images: data.images ?? [],
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
    });

    return room.save();
  }

  async findById(id: string) {
    const room = await this.hotelRoomModel
      .findById(id)
      .populate('hotel')
      .lean()
      .exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async search(params: SearchRoomsParams) {
    const query: any = { hotel: params.hotel.toString() };
    if (params.isEnabled !== undefined) {
      query.isEnabled = params.isEnabled;
    }

    return this.hotelRoomModel
      .find(query)
      .skip(params.offset || 0)
      .limit(params.limit || 10)
      .populate('hotel')
      .lean()
      .exec();
  }

  async update(id: string, data: Partial<HotelRoom>) {
    return this.hotelRoomModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('hotel')
      .lean()
      .exec();
  }
}