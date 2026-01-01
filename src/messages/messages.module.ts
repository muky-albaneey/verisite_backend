import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController, MessagesReadController } from './messages.controller';
import { Message, Conversation, ConversationParticipant } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation, ConversationParticipant])],
  controllers: [MessagesController, MessagesReadController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

