import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation, ConversationParticipant, User, Project, Message } from '../database/entities';
import { DbRole } from '../contracts';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(userId: string) {
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: ['conversation'],
    });

    const conversationIds = participants.map((p) => p.conversationId);
    if (conversationIds.length === 0) return [];
    
    return this.conversationRepository.find({
      where: { id: In(conversationIds) },
      relations: ['participants', 'project'],
    });
  }

  async findOne(id: string, userId: string): Promise<Conversation> {
    const participant = await this.participantRepository.findOne({
      where: { conversationId: id, userId },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied');
    }

    return this.conversationRepository.findOne({
      where: { id },
      relations: ['participants', 'project'],
    });
  }

  async create(projectId: string, userIds: string[], currentUser: User): Promise<Conversation> {
    let project = null;
    let projectName = 'Direct Message';

    if (projectId) {
      project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) throw new NotFoundException('Project not found');
      projectName = project.name;
    }

    const conversation = this.conversationRepository.create({
      projectId,
      projectName,
      avatarUrl: project?.coverImageUrl,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // Add participants
    const allUserIds = [...new Set([currentUser.id, ...userIds])];
    for (const uid of allUserIds) {
      const user = await this.userRepository.findOne({ where: { id: uid } });
      if (user) {
        const participant = this.participantRepository.create({
          conversationId: savedConversation.id,
          userId: uid,
          role: user.role,
        });
        await this.participantRepository.save(participant);
      }
    }

    return savedConversation;
  }

  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    await this.findOne(conversationId, userId); // Check access

    const skip = (page - 1) * limit;
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { messages: messages.reverse(), total };
  }
}

