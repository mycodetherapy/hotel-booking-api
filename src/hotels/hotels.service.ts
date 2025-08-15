import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel } from './schemas/hotel.schema';
import { IHotelService } from './interfaces/hotel-service.interface';
import { SearchHotelParams } from './interfaces/search-hotel-params.interface';
import { UpdateHotelParams } from './interfaces/update-hotel-params.interface';

@Injectable()
export class HotelsService implements IHotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<Hotel>,
  ) {
  }

  async create(data: any): Promise<Hotel> {
    const hotel = new this.hotelModel(data);
    return hotel.save();
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.hotelModel.findById(id).exec();
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const { limit, offset, title } = params;
    const query = {
      title: { $regex: new RegExp(title, 'i') },
    };
    return this.hotelModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async update(id: string, data: UpdateHotelParams): Promise<Hotel | null> {
    return this.hotelModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}