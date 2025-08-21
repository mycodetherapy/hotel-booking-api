import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../users/decorators/roles.decorator';
import { SupportRequestService } from '../services/support-request.service';
import { SupportRequestClientService } from '../services/support-request-client.service';
import { SupportRequestEmployeeService } from '../services/support-request-employee.service';
import { MarkMessagesReadDto, SendMessageDto } from '../dto';
import { mapMessage } from '../utils/mappers';
import { AuthenticatedGuard } from '../../auth/session.serializer';

@Controller('common/support-requests')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('client', 'manager')
export class CommonSupportRequestsController {
  constructor(
    private readonly supportSrv: SupportRequestService,
    private readonly clientSrv: SupportRequestClientService,
    private readonly employeeSrv: SupportRequestEmployeeService,
  ) {
  }

  // 2.5.4 История сообщений
  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @Req() req) {
    await this.authorizeAccess(id, req);
    const messages = await this.supportSrv.getMessages(id);
    return messages.map((m) => mapMessage(m));
  }

  // 2.5.5 Отправка сообщения
  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Req() req, @Body() body: SendMessageDto) {
    await this.authorizeAccess(id, req);
    await this.supportSrv.sendMessage({
      author: String(req.user._id),
      supportRequest: id,
      text: body.text,
    });
    const messages = await this.supportSrv.getMessages(id);
    return messages.map((m) => mapMessage(m));
  }

  // 2.5.6 Отметка, что сообщения прочитаны
  @Post(':id/messages/read')
  async markRead(@Param('id') id: string, @Req() req, @Body() body: MarkMessagesReadDto) {
    await this.authorizeAccess(id, req);
    const dto = {
      user: String(req.user._id),
      supportRequest: id,
      createdBefore: new Date(body.createdBefore),
    };

    if (req.user.role === 'client') {
      await this.clientSrv.markMessagesAsRead(dto);
    } else {
      await this.employeeSrv.markMessagesAsRead(dto);
    }

    return { success: true };
  }

  private async authorizeAccess(supportRequestId: string, req: any) {
    if (req.user.role === 'manager') return;
    const sr = await this.supportSrv.getByIdOrFail(supportRequestId);
    if (String(sr.user) !== String(req.user._id)) {
      throw new ForbiddenException('No access to this support request');
    }
  }
}
