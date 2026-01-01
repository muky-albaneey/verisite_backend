import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User } from '../database/entities';
import { DbNotificationType } from '../contracts';
import { toDbNotificationType } from '../common/utils/enum-mapper';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { notifications, total };
  }

  async getUnread(userId: string) {
    return this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.notificationRepository.remove(notification);
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    avatarUrl?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: toDbNotificationType(data.type),
      avatarUrl: data.avatarUrl,
      relatedEntityId: data.relatedEntityId,
      relatedEntityType: data.relatedEntityType,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }
}

