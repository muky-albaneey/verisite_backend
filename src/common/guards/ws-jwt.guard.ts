import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      const jwtConfig = this.configService.get('jwt');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConfig.accessSecret,
      });
      client.data.user = payload;
      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) {
      return client.handshake.auth?.token;
    }
    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

