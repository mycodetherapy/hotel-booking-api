import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHotelRoomDto {
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}