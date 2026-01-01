import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { DbMediaType } from '../../contracts';

@Entity('project_media')
export class ProjectMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    type: 'enum',
    enum: DbMediaType,
    enumName: 'media_type_enum',
    default: DbMediaType.IMAGE,
  })
  type: DbMediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'bigint', nullable: true })
  size?: number;

  @Column({ nullable: true })
  mimeType?: string;

  @CreateDateColumn()
  createdAt: Date;
}

