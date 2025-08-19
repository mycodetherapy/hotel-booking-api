import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../users/decorators/roles.decorator';
import { SupportRequestService } from '../services/support-request.service';
import { SupportRequestClientService } from '../services/support-request-client.service';
import { CreateSupportRequestDto, ListQueryDto } from '../dto';
import { mapChatForClientList } from '../utils/mappers';
import { AuthenticatedGuard } from '../../auth/session.serializer';

@Controller('client/support-requests')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('client')
export class ClientSupportRequestsController {
  constructor(
    private readonly supportSrv: SupportRequestService,
    private readonly clientSrv: SupportRequestClientService,
  ) {
  }

  // 2.5.1 Создание обращения
  @Post('/')
  async create(@Req() req, @Body() body: CreateSupportRequestDto) {
    const sr = await this.clientSrv.createSupportRequest({ user: req.user._id, text: body.text });
    // Спека показывает массив — вернём массив с одним элементом
    return [mapChatForClientList(sr, String(req.user._id))];
  }

  // 2.5.2 Список обращений клиента
  @Get('/')
  async list(@Req() req, @Query() query: ListQueryDto) {
    const isActive = typeof query.isActive === 'string' ? query.isActive === 'true' : undefined;
    const items = await this.supportSrv.findSupportRequests({ user: String(req.user._id), isActive });

    const sliced = items.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? items.length));
    return sliced.map((sr) => mapChatForClientList(sr, String(req.user._id)));
  }
}
