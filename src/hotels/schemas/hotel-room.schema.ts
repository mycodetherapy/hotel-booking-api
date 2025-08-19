import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Hotel } from './hotel.schema';

export type HotelRoomDocument = HotelRoom & Document & { _id: Types.ObjectId };

@Schema()
export class HotelRoom {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Hotel' })
  hotel: Hotel;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);