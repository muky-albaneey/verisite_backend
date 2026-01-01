import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Conversation, ConversationParticipant, User } from '../database/entities';
import { MessageType } from '../database/entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
  ) {}

  async create(
    conversationId: string,
    senderId: string,
    text: string,
    type: MessageType = MessageType.TEXT,
    fileUrl?: string,
    fileName?: string,
  ): Promise<Message> {
    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId: senderId },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = this.messageRepository.create({
      conversationId,
      senderId,
      text,
      type,
      fileUrl,
      fileName,
      isRead: false,
    });

    return this.messageRepository.save(message);
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['conversation'],
    });

    if (!message) throw new NotFoundException('Message not found');

    const participant = await this.participantRepository.findOne({
      where: { conversationId: message.conversationId, userId },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied');
    }

    message.isRead = true;
    return this.messageRepository.save(message);
  }
}

