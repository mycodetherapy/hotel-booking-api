import { IsDateString, IsNotEmpty } from 'class-validator';

export class MarkMessagesReadDto {
  @IsNotEmpty()
  @IsDateString()
  createdBefore: Date;
}