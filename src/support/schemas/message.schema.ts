import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ _id: true })
export class Message {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  readAt?: Date | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
