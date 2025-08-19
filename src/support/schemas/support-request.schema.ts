import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Message, MessageSchema } from './message.schema';

export type SupportRequestDocument = HydratedDocument<SupportRequest>;

@Schema()
export class SupportRequest {
  @Prop({ type: Types.ObjectId, required: true, unique: true, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: [MessageSchema], default: [] })
  messages: Message[];

  @Prop({ default: true })
  isActive: boolean;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);
