import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../users/decorators/roles.decorator';
import { SupportRequestService } from '../services/support-request.service';
import { ListQueryDto } from '../dto';
import { mapChatForManagerList } from '../utils/mappers';
import { AuthenticatedGuard } from '../../auth/session.serializer';

@Controller('manager/support-requests')

export class ManagerSupportRequestsController {
  constructor(
    private readonly supportSrv: SupportRequestService,
  ) {
  }
  
  @Get('/')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('manager')
  async list(@Query() query: ListQueryDto) {
    const isActive = typeof query.isActive === 'string' ? query.isActive === 'true' : undefined;
    const items = await this.supportSrv.findSupportRequests({ user: null, isActive });

    const sliced = items.slice(query.offset ?? 0, (query.offset ?? 0) + (query.limit ?? items.length));

    return sliced.map((sr) => mapChatForManagerList(sr));
  }
}
