import { Controller, Post, Put, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';
import { MessageType } from '../database/entities/message.entity';

@ApiTags('Messages')
@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send message' })
  async create(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body('text') text: string,
    @Body('type') type: MessageType,
    @Body('fileUrl') fileUrl: string,
    @Body('fileName') fileName: string,
    @CurrentUser() user: User,
  ) {
    const message = await this.messagesService.create(
      conversationId,
      user.id,
      text,
      type,
      fileUrl,
      fileName,
    );
    return { message };
  }
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesReadController {
  constructor(private readonly messagesService: MessagesService) {}

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const message = await this.messagesService.markAsRead(id, user.id);
    return { message };
  }
}

