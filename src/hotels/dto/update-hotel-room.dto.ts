import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateHotelRoomDto {
  @IsString()
  @IsOptional()
  hotelId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}