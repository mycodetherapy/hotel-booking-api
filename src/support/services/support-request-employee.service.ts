import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportRequest, SupportRequestDocument } from '../schemas/support-request.schema';
import { ISupportRequestEmployeeService, MarkMessagesAsReadDto } from '../interfaces/support.interfaces';

@Injectable()
export class SupportRequestEmployeeService implements ISupportRequestEmployeeService {
  constructor(@InjectModel(SupportRequest.name) private readonly srModel: Model<SupportRequestDocument>) {
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
          'm.author': { $eq: sr.user },
        }],
      },
    ).exec();
  }

  async getUnreadCount(supportRequest: string): Promise<number> {
    const sr = await this.srModel.findById(supportRequest).lean();
    if (!sr) return 0;
    return sr.messages.filter((m) => !m.readAt && String(m.author) === String(sr.user)).length;
  }
  
  async closeRequest(supportRequest: string): Promise<void> {
    await this.srModel.findByIdAndUpdate(supportRequest, { $set: { isActive: false } }).exec();
  }
}
