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
    const srData = {
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
    };

    return this.srModel.create(srData);
  }

  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    const sr = await this.srModel.findById(params.supportRequest, 'user').lean();
    if (!sr) return;

    const before = new Date(params.createdBefore);

    await this.srModel.updateOne(
      { _id: params.supportRequest },
      {
        $set: {
          'messages.$[m].readAt': new Date(),
        },
      },
      {
        arrayFilters: [{
          'm.readAt': null,
          'm.createdAt': { $lte: before },
          'm.author': { $ne: new Types.ObjectId(params.user) },
        }],
      },
    ).exec();
  }

  async getUnreadCount(supportRequest: string): Promise<number> {
    const sr = await this.srModel.findById(supportRequest).lean();
    if (!sr) return 0;
    return sr.messages.filter((m) => !m.readAt && String(m.author) !== String(sr.user)).length;
  }
}
