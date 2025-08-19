import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportRequest, SupportRequestDocument } from '../schemas/support-request.schema';
import { ISupportRequestEmployeeService, MarkMessagesAsReadDto } from '../interfaces/support.interfaces';

@Injectable()
export class SupportRequestEmployeeService implements ISupportRequestEmployeeService {
  constructor(@InjectModel(SupportRequest.name) private readonly srModel: Model<SupportRequestDocument>) {
  }

  // 4. employee.markMessagesAsRead — помечаем сообщения, которые были отправлены пользователем (клиентом)
  async markMessagesAsRead(params: MarkMessagesAsReadDto): Promise<void> {
    const sr = await this.srModel.findById(params.supportRequest);
    if (!sr) return;

    const before = new Date(params.createdBefore);

    sr.messages.forEach((m) => {
      const isFromClient = String(m.author) === String(sr.user);
      if (!m.readAt && isFromClient && m.createdAt <= before) {
        m.readAt = new Date();
      }
    });

    await sr.save();
  }

  // 3. employee.getUnreadCount — считаем сообщения от пользователя без readAt
  async getUnreadCount(supportRequest: string): Promise<number> {
    const sr = await this.srModel.findById(supportRequest).lean();
    if (!sr) return 0;
    return sr.messages.filter((m) => !m.readAt && String(m.author) === String(sr.user)).length;
  }

  // 5. closeRequest — isActive = false
  async closeRequest(supportRequest: string): Promise<void> {
    await this.srModel.findByIdAndUpdate(supportRequest, { $set: { isActive: false } }).exec();
  }
}
