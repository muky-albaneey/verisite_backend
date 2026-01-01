import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';

export enum DocumentType {
  PLAN = 'PLAN',
  FINAL = 'FINAL',
  OTHER = 'OTHER',
}

@Entity('project_documents')
@Index(['projectId'])
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    type: 'enum',
    enum: DocumentType,
    enumName: 'document_type_enum',
  })
  type: DocumentType;

  @Column()
  url: string;

  @Column()
  name: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;
}

