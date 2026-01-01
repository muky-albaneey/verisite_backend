import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';
import { DbMediaType } from '../../contracts';

@Entity('report_media')
export class ReportMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_id' })
  reportId: string;

  @ManyToOne(() => Report, (report) => report.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({
    type: 'enum',
    enum: DbMediaType,
    enumName: 'media_type_enum',
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

