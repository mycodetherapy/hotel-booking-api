import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelDocument } from './schemas/hotel.schema';
import { IHotelService } from './interfaces/hotel-service.interface';
import { SearchHotelParams } from './interfaces/search-hotel-params.interface';
import { UpdateHotelParams } from './interfaces/update-hotel-params.interface';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Injectable()
export class HotelsService implements IHotelService {
  constructor(
    @InjectModel(Hotel.name) private readonly hotelModel: Model<HotelDocument>,
  ) {
  }

  async create(data: CreateHotelDto): Promise<HotelDocument> {
    const hotel = new this.hotelModel(data);
    return hotel.save();
  }

  async findById(id: string): Promise<Hotel | null> {
    return this.hotelModel.findById(id).lean().exec();
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
      .lean()
      .exec();
  }
}