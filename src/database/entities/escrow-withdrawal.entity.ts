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
import { DbEscrowStatus } from '../../contracts';

@Entity('escrow_withdrawals')
export class EscrowWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.escrowWithdrawals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  bankName: string;

  @Column()
  accountNo: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  date?: Date;

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

