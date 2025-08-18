import { Expose } from 'class-transformer';

export class HotelResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
