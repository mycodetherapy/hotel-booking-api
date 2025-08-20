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

// Если у тебя есть WS-авторизация — можешь повесить гарды тут тоже

@WebSocketGateway({ cors: true })
export class SupportRequestGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly supportSrv: SupportRequestService) {
  }

  afterInit() {
    // подписываем gateway на эвенты сервиса
    this.supportSrv.subscribe((sr, message) => {

      console.log('message', message, 'sr', sr);
      const payload = {
        id: String(message._id),
        text: message.text,
        readAt: message.readAt,
        author: {
          id: String(message.author),
          name: '', // при необходимости подставь имя автора
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
