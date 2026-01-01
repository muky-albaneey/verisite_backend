import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const jwtConfig = this.configService.get('jwt');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConfig.accessSecret,
      });
      
      client.data.user = payload;
      client.join(`user:${payload.sub}`);
      console.log(`Client connected: ${payload.sub}`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      console.log(`Client disconnected: ${user.sub || user.id}`);
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) {
      return client.handshake.auth?.token;
    }
    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('leave:conversation')
  handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('message:new')
  handleNewMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', data);
  }

  @SubscribeMessage('message:read')
  handleMessageRead(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.server.to(`conversation:${data.conversationId}`).emit('message:read', data);
  }
}

