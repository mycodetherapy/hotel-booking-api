import { IsDateString, IsNotEmpty, IsString } from 'class-validator';


export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  hotelRoom: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}