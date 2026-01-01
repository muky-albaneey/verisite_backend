import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DbAssignmentStatus, DbMilestoneName } from '../../contracts';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Report } from './report.entity';

@Entity('assignments')
@Index(['projectId'])
@Index(['fieldOpsId'])
@Index(['status'])
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'admin_id', nullable: true })
  adminId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin?: User;

  @Column({ name: 'field_ops_id' })
  fieldOpsId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_ops_id' })
  fieldOps: User;

  @Column({
    type: 'enum',
    enum: DbMilestoneName,
    enumName: 'milestone_name_enum',
  })
  milestone: DbMilestoneName;

  @Column({
    type: 'enum',
    enum: DbAssignmentStatus,
    enumName: 'assignment_status_enum',
    default: DbAssignmentStatus.PENDING,
  })
  status: DbAssignmentStatus;

  @Column({ name: 'assigned_date' })
  assignedDate: Date;

  @Column({ name: 'due_date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Report, (report) => report.assignment)
  reports: Report[];
}

