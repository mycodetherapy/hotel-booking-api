import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HotelDocument = Hotel & Document & { _id: Types.ObjectId };
;

@Schema()
export class Hotel {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);