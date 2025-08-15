import { HotelRoom } from '../schemas/hotel-room.schema';
import { SearchRoomsParams } from './search-rooms-params.interface';

export interface HotelRoomService {
  create(data: Partial<HotelRoom>): Promise<HotelRoom>;

  findById(id: string): Promise<HotelRoom | null>;

  search(params: SearchRoomsParams): Promise<HotelRoom[]>;

  update(id: string, data: Partial<HotelRoom>): Promise<HotelRoom | null>;
}