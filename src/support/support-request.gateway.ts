import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportRequestService } from './services/support-request.service';

@WebSocketGateway({ cors: true })
export class SupportRequestGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly supportSrv: SupportRequestService) {
  }

  afterInit() {
    this.supportSrv.subscribe((sr, message) => {
      const payload = {
        id: String(message._id),
        text: message.text,
        readAt: message.readAt,
        author: {
          id: String(message.author._id),
          name: (message.author as any)?.name || '',
        },
      };
      this.server.to(String(sr._id)).emit('message', payload);
    });
  }

  // 2.5.7 Подписка
  @SubscribeMessage('subscribeToChat')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(String(chatId));
  }
}
