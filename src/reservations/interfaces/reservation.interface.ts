import { Reservation } from '../schemas/reservation.schema';
import { ReservationSearchOptions } from './reservation-search-options.interface';
import { ReservationDto } from '../dto/reservation.dto';

export interface IReservation {
  addReservation(data: ReservationDto): Promise<Reservation>;

  removeReservation(id: string): Promise<void>;

  getReservations(filter: ReservationSearchOptions): Promise<Reservation[]>;
}