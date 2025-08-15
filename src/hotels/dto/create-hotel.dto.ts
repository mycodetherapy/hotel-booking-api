import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;
}