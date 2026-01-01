import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { DbRole, DbUserStatus } from '../../contracts';
import { RefreshToken } from './refresh-token.entity';
import { Project } from './project.entity';
import { Wallet } from './wallet.entity';
import { DeveloperProfile } from './developer-profile.entity';
import { Notification } from './notification.entity';
import { Message } from './message.entity';
import { ConversationParticipant } from './conversation-participant.entity';
import { Report } from './report.entity';
import { Assignment } from './assignment.entity';
import { Review } from './review.entity';
import { BankAccount } from './bank-account.entity';

@Entity('users')
@Index(['role'])
@Index(['status'])
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: 'english' })
  language: string;

  @Column({ default: 'GMT+1' })
  timezone: string;

  @Column({
    type: 'enum',
    enum: DbRole,
    enumName: 'user_role_enum',
  })
  role: DbRole;

  @Column({
    type: 'enum',
    enum: DbUserStatus,
    enumName: 'user_status_enum',
    default: DbUserStatus.PENDING,
  })
  status: DbUserStatus;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Project, (project) => project.client)
  clientProjects: Project[];

  @OneToMany(() => Project, (project) => project.developer)
  developerProjects: Project[];

  @OneToMany(() => Project, (project) => project.fieldOps)
  fieldOpsProjects: Project[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToOne(() => DeveloperProfile, (profile) => profile.user)
  developerProfile: DeveloperProfile;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => ConversationParticipant, (participant) => participant.user)
  conversationParticipants: ConversationParticipant[];

  @OneToMany(() => Report, (report) => report.createdBy)
  reports: Report[];

  @OneToMany(() => Report, (report) => report.reviewedBy)
  reviewedReports: Report[];

  @OneToMany(() => Assignment, (assignment) => assignment.fieldOps)
  assignments: Assignment[];

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => BankAccount, (account) => account.user)
  bankAccounts: BankAccount[];
}

