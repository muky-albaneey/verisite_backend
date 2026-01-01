import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DbMilestoneName, DbMilestoneStatus } from '../../contracts';
import { Project } from './project.entity';

@Entity('milestones')
@Index(['projectId'])
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.milestones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    type: 'enum',
    enum: DbMilestoneName,
    enumName: 'milestone_name_enum',
  })
  name: DbMilestoneName;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({
    type: 'enum',
    enum: DbMilestoneStatus,
    enumName: 'milestone_status_enum',
    default: DbMilestoneStatus.PENDING,
  })
  status: DbMilestoneStatus;

  @Column({ name: 'expected_completion', nullable: true })
  expectedCompletion?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget?: number;

  @Column({ name: 'date_started', nullable: true })
  dateStarted?: Date;

  @Column({ name: 'date_completed', nullable: true })
  dateCompleted?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

