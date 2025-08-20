import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Types } from 'mongoose';
import { SupportRequest, SupportRequestDocument } from '../schemas/support-request.schema';
import { Message } from '../schemas/message.schema';
import { GetChatListParams, ISupportRequestService, SendMessageDto } from '../interfaces/support.interfaces';

@Injectable()
export class SupportRequestService implements ISupportRequestService {
  constructor(
    @InjectModel(SupportRequest.name) private readonly srModel: Model<SupportRequestDocument>,
    private readonly events: EventEmitter2,
  ) {
  }

  async findSupportRequests(params: GetChatListParams): Promise<SupportRequest[]> {
    const filter: any = {};
    if (params.user) filter.user = new Types.ObjectId(params.user);
    if (typeof params.isActive === 'boolean') filter.isActive = params.isActive;
    return this.srModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getByIdOrFail(id: string): Promise<SupportRequestDocument> {
    const doc = await this.srModel.findById(id);
    if (!doc) throw new NotFoundException('Support request not found');
    return doc;
  }

  async sendMessage(data: SendMessageDto): Promise<Message> {
    const sr = await this.getByIdOrFail(data.supportRequest);
    const message: Message = {
      _id: new Types.ObjectId(),
      author: new Types.ObjectId(data.author),
      text: data.text,
      createdAt: new Date(),
      readAt: null,
    } as any;

    sr.messages.push(message);
    await sr.save();

    this.events.emit('supportRequest.newMessage', { supportRequest: sr, message });

    return message;
  }

  async getMessages(supportRequest: string): Promise<Message[]> {
    const sr = await this.getByIdOrFail(supportRequest);
    return sr.messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  subscribe(handler: (supportRequest: SupportRequest, message: Message) => void): () => void {
    const listener = ({ supportRequest, message }) => handler(supportRequest, message);
    this.events.on('supportRequest.newMessage', listener);
    return () => this.events.off('supportRequest.newMessage', listener);
  }
}
