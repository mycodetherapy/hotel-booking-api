import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupportRequestDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}