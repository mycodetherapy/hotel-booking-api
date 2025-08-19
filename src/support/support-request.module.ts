import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { SupportRequest, SupportRequestSchema } from './schemas/support-request.schema';

import { SupportRequestService } from './services/support-request.service';
import { SupportRequestClientService } from './services/support-request-client.service';
import { SupportRequestEmployeeService } from './services/support-request-employee.service';

import { ClientSupportRequestsController } from './controllers/client.controller';
import { ManagerSupportRequestsController } from './controllers/manager.controller';
import { CommonSupportRequestsController } from './controllers/common.controller';

import { SupportRequestGateway } from './support-request.gateway';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([{ name: SupportRequest.name, schema: SupportRequestSchema }]),
  ],
  controllers: [
    ClientSupportRequestsController,
    ManagerSupportRequestsController,
    CommonSupportRequestsController,
  ],
  providers: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
    SupportRequestGateway,
  ],
  exports: [
    SupportRequestService,
    SupportRequestClientService,
    SupportRequestEmployeeService,
  ],
})
export class SupportRequestModule {
}
