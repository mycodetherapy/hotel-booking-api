import { Hotel } from '../schemas/hotel.schema';
import { SearchHotelParams } from './search-hotel-params.interface';
import { UpdateHotelParams } from './update-hotel-params.interface';

export interface IHotelService {
  create(data: any): Promise<Hotel>;

  findById(id: string): Promise<Hotel | null>;

  search(params: SearchHotelParams): Promise<Hotel[]>;

  update(id: string, data: UpdateHotelParams): Promise<Hotel | null>;
}