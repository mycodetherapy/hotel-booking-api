import { ID } from '../../types';

export interface ReservationSearchOptions {
  userId: ID;
  dateStart?: Date;
  dateEnd?: Date;
}