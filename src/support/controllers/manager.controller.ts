import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../users/decorators/roles.decorator';
import { SupportRequestService } from '../services/support-request.service';
import { ListQueryDto } from '../dto';
import { mapChatForManagerList } from '../utils/mappers';
import { AuthenticatedGuard } from '../../auth/session.serializer';

// Если есть UserService — импортни и подставь профиль клиента по sr.user
// import { UsersService } from '../../users/users.service';

@Controller('manager/support-requests')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('manager')
export class ManagerSupportRequestsController {
  constructor(
    private readonly supportSrv: SupportRequestService,
    // private readonly usersService: UsersService,
  ) {
  }

  // 2.5.3 Список обращений для менеджера
  @Get('/')
  async list(@Query() query: ListQueryDto) {
    const isActive = typeof query.isActive === 'string' ? query.isActive === 'true' : undefined;
    const items = await this.supportSrv.findSupportRequests({ user: null, isActive });

    const sliced = items.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? items.length));

    // Если есть UsersService, раскомментируй получение клиента:
    // const clientsMap = new Map<string, any>();
    // for (const sr of sliced) {
    //   const id = String(sr.user);
    //   if (!clientsMap.has(id)) {
    //     clientsMap.set(id, await this.usersService.findById(id));
    //   }
    // }
    // return sliced.map((sr) => mapChatForManagerList(sr, clientsMap.get(String(sr.user))));

    return sliced.map((sr) => mapChatForManagerList(sr)); // без обогащения
  }
}
