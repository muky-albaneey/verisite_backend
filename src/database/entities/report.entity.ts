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
import { DbReportStatus } from '../../contracts';
import { Project } from './project.entity';
import { Assignment } from './assignment.entity';
import { User } from './user.entity';
import { ReportMedia } from './report-media.entity';
import { ReportComment } from './report-comment.entity';
import { FieldObservation } from './field-observation.entity';
import { MaterialsNote } from './materials-note.entity';

@Entity('reports')
@Index(['projectId'])
@Index(['assignmentId'])
@Index(['createdById'])
@Index(['status'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reportCode: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'assignment_id' })
  assignmentId: string;

  @ManyToOne(() => Assignment, (assignment) => assignment.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  reportText?: string;

  @Column({
    type: 'enum',
    enum: DbReportStatus,
    enumName: 'report_status_enum',
    default: DbReportStatus.PENDING,
  })
  status: DbReportStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercent: number;

  @Column({ name: 'expected_completion', nullable: true })
  expectedCompletion?: Date;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById?: string;

  @ManyToOne(() => User, (user) => user.reviewedReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ReportMedia, (media) => media.report)
  media: ReportMedia[];

  @OneToMany(() => ReportComment, (comment) => comment.report)
  comments: ReportComment[];

  @OneToMany(() => FieldObservation, (observation) => observation.report)
  fieldObservations: FieldObservation[];

  @OneToMany(() => MaterialsNote, (note) => note.report)
  materialsNotes: MaterialsNote[];
}

