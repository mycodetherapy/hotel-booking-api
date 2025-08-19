export class ReservationResponseDto {
  startDate: Date;
  endDate: Date;
  hotelRoom: {
    description: string;
    images: string[];
  };
  hotel: {
    title: string;
    description: string;
  };
}
