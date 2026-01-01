import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DbNotificationType } from '../../contracts';

@Entity('notifications')
@Index(['userId'])
@Index(['isRead'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: DbNotificationType,
    enumName: 'notification_type_enum',
  })
  type: DbNotificationType;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId?: string;

  @Column({ name: 'related_entity_type', nullable: true })
  relatedEntityType?: string;

  @CreateDateColumn()
  createdAt: Date;
}

