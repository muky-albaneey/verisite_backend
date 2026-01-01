import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import {
  DbProjectStatus,
  DbDeveloperAcceptanceStatus,
  DbConstructionType,
} from '../../contracts';
import { User } from './user.entity';
import { ProjectMedia } from './project-media.entity';
import { ProjectDocument } from './project-document.entity';
import { Assignment } from './assignment.entity';
import { Milestone } from './milestone.entity';
import { Conversation } from './conversation.entity';
import { Review } from './review.entity';
import { EscrowTransfer } from './escrow-transfer.entity';
import { EscrowWithdrawal } from './escrow-withdrawal.entity';

@Entity('projects')
@Index(['status'])
@Index(['clientId'])
@Index(['developerId'])
@Index(['fieldOpsId'])
@Index(['location'])
@Index(['createdAt'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  typeOfConstruction?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({
    type: 'enum',
    enum: DbProjectStatus,
    enumName: 'project_status_enum',
    default: DbProjectStatus.PENDING_REVIEW,
  })
  status: DbProjectStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ name: 'developer_id', nullable: true })
  developerId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'developer_id' })
  developer?: User;

  @Column({ name: 'field_ops_id', nullable: true })
  fieldOpsId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'field_ops_id' })
  fieldOps?: User;

  @Column({
    type: 'enum',
    enum: DbDeveloperAcceptanceStatus,
    enumName: 'developer_acceptance_status_enum',
    default: DbDeveloperAcceptanceStatus.PENDING,
  })
  developerAcceptanceStatus: DbDeveloperAcceptanceStatus;

  @Column({ name: 'developer_accepted_at', nullable: true })
  developerAcceptedAt?: Date;

  @Column({ name: 'developer_rejected_at', nullable: true })
  developerRejectedAt?: Date;

  @Column({ name: 'developer_rejection_reason', type: 'text', nullable: true })
  developerRejectionReason?: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'due_date', nullable: true })
  dueDate?: Date;

  @Column({ name: 'start_date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToMany(() => ProjectMedia, (media) => media.project)
  images: ProjectMedia[];

  @OneToMany(() => ProjectDocument, (doc) => doc.project)
  projectPlanDoc: ProjectDocument[];

  @OneToMany(() => ProjectDocument, (doc) => doc.project)
  finalDocumentation: ProjectDocument[];

  @OneToMany(() => Assignment, (assignment) => assignment.project)
  assignments: Assignment[];

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @OneToMany(() => Conversation, (conversation) => conversation.project)
  conversations: Conversation[];

  @OneToMany(() => Review, (review) => review.project)
  reviews: Review[];

  @OneToMany(() => EscrowTransfer, (transfer) => transfer.project)
  escrowTransfers: EscrowTransfer[];

  @OneToMany(() => EscrowWithdrawal, (withdrawal) => withdrawal.project)
  escrowWithdrawals: EscrowWithdrawal[];
}

