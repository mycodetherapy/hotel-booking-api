import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SupportRequest, SupportRequestDocument } from '../schemas/support-request.schema';
import {
  CreateSupportRequestDto,
  ISupportRequestClientService,
  MarkMessagesAsReadDto,
} from '../interfaces/support.interfaces';

@Injectable()
export class SupportRequestClientService implements ISupportRequestClientService {
  constructor(@InjectModel(SupportRequest.name) private readonly srModel: Model<SupportRequestDocument>) {
  }

  async createSupportRequest(data: CreateSupportRequestDto): Promise<SupportRequest> {
    const sr = new this.srModel({
      user: new Types.ObjectId(data.user),
      createdAt: new Date(),
      isActive: true,
      messages: [
        {
          _id: new Types.ObjectId(),
          author: new Types.ObjectId(data.user),
          text: data.text,
          createdAt: new Date(),
          readAt: null,
        },
      ],
    });
    return sr.save();
  }

  // 2. client.markMessagesAsRead — помечаем сообщения, которые НЕ от пользователя (т.е. от сотрудников)
  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    const sr = await this.srModel.findById(params.supportRequest);
    if (!sr) return;

    const before = new Date(params.createdBefore);
    const userId = String(params.user);

    sr.messages.forEach((m) => {
      const isFromEmployee = String(m.author) !== String(sr.user);
      if (!m.readAt && isFromEmployee && m.createdAt <= before) {
        m.readAt = new Date();
      }
    });

    await sr.save();
  }

  // 1. client.getUnreadCount — считаем сообщения от сотрудников без readAt
  async getUnreadCount(supportRequest: string): Promise<number> {
    const sr = await this.srModel.findById(supportRequest).lean();
    if (!sr) return 0;
    return sr.messages.filter((m) => !m.readAt && String(m.author) !== String(sr.user)).length;
  }
}
