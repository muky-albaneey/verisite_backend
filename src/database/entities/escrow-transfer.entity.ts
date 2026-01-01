import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { DbEscrowStatus } from '../../contracts';

@Entity('escrow_transfers')
export class EscrowTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.escrowTransfers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'transfer_to_user_id', nullable: true })
  transferToUserId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transfer_to_user_id' })
  transferToUser?: User;

  @Column()
  transferTo: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  dateSent?: Date;

  @Column({
    type: 'enum',
    enum: DbEscrowStatus,
    enumName: 'escrow_status_enum',
    default: DbEscrowStatus.PENDING,
  })
  status: DbEscrowStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

