import { IsOptional, IsString } from 'class-validator';

export class UpdateHotelDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}