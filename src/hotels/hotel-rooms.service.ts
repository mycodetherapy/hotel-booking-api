import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotelRoom } from './schemas/hotel-room.schema';
import { HotelRoomService } from './interfaces/hotel-room-service.interface';
import { SearchRoomsParams } from './interfaces/search-rooms-params.interface';
import { Hotel } from './schemas/hotel.schema';

@Injectable()
export class HotelRoomsService implements HotelRoomService {
  constructor(
    @InjectModel(HotelRoom.name)
    private readonly hotelRoomModel: Model<HotelRoom>,
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<Hotel>,
  ) {
  }


  async create(data: Partial<HotelRoom>): Promise<HotelRoom> {
    const hotel = await this.hotelModel.findById(data.hotel).lean().exec();
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const room = new this.hotelRoomModel({
      ...data,
      hotel: hotel._id,
    });

    return room.save();
  }

  async findById(id: string): Promise<HotelRoom | null> {
    return this.hotelRoomModel
      .findById(id)
      .populate('hotel')
      .lean()
      .exec();
  }

  async search(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const { limit = 10, offset = 0, hotel, isEnabled } = params;

    const query: any = {
      hotel: new Types.ObjectId(hotel),
    };

    if (typeof isEnabled === 'boolean') {
      query.isEnabled = isEnabled;
    }

    return this.hotelRoomModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .populate('hotel', 'title description')
      .lean()
      .exec();
  }

  async update(id: string, data: Partial<HotelRoom>): Promise<HotelRoom | null> {
    return this.hotelRoomModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('hotel')
      .lean()
      .exec();
  }
}