import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    const savedRoom = await room.save();

    const populatedRoom = await this.hotelRoomModel
      .findById(savedRoom._id)
      .populate('hotel', 'title description')
      .exec();

    if (!populatedRoom) {
      throw new NotFoundException('Room not found after creation');
    }

    return populatedRoom;
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

    const query: any = {};

    if (params.hotel) {
      query.hotel = new Types.ObjectId(params.hotel);
    }

    if (params.isEnabled !== undefined) {
      query.isEnabled = params.isEnabled;
    }

    const result = await this.hotelRoomModel
      .find(query)
      .skip(params.offset || 0)
      .limit(params.limit || 10)
      .populate('hotel', 'title')
      .lean()
      .exec();

    console.log('Found rooms:', result.length);
    return result;
  }

  async update(id: string, data: Partial<HotelRoom>) {
    return this.hotelRoomModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('hotel')
      .lean()
      .exec();
  }
}