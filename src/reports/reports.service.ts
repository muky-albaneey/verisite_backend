import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, Assignment, User, ReportMedia, Project } from '../database/entities';
import { DbRole, DbReportStatus, DbMediaType } from '../contracts';
import { toDbReportStatus, toDbMediaType } from '../common/utils/enum-mapper';
import { UploadService, UploadFolder } from '../upload/upload.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(ReportMedia)
    private reportMediaRepository: Repository<ReportMedia>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private uploadService: UploadService,
  ) {}

  private generateReportCode(): string {
    const prefix = 'FD';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${random}`;
  }

  async findAll(currentUser: User, page: number = 1, limit: number = 10) {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.assignment', 'assignment')
      .leftJoinAndSelect('report.createdBy', 'createdBy');

    if (currentUser.role === DbRole.FIELD_OPS) {
      query.where('report.createdById = :userId', { userId: currentUser.id });
    }

    const skip = (page - 1) * limit;
    const [reports, total] = await query.skip(skip).take(limit).orderBy('report.createdAt', 'DESC').getManyAndCount();

    return { reports, total };
  }

  async findOne(id: string, currentUser: User): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['assignment', 'createdBy', 'media', 'comments'],
    });

    if (!report) throw new NotFoundException('Report not found');

    if (currentUser.role === DbRole.FIELD_OPS && report.createdById !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return report;
  }

  async create(
    assignmentId: string,
    title: string,
    reportText: string,
    currentUser: User,
  ): Promise<Report> {
    if (currentUser.role !== DbRole.FIELD_OPS) {
      throw new ForbiddenException('Only field ops can create reports');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, fieldOpsId: currentUser.id },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    const report = this.reportRepository.create({
      reportCode: this.generateReportCode(),
      projectId: assignment.projectId,
      assignmentId,
      createdById: currentUser.id,
      title,
      reportText,
      status: DbReportStatus.PENDING,
      progressPercent: 0,
    });

    return this.reportRepository.save(report);
  }

  async uploadMedia(reportId: string, file: Express.Multer.File, currentUser: User): Promise<ReportMedia> {
    const report = await this.findOne(reportId, currentUser);

    const uploadResult = await this.uploadService.uploadFile(
      file,
      UploadFolder.REPORTS,
      reportId,
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'],
    );

    const media = this.reportMediaRepository.create({
      reportId,
      type: file.mimetype.startsWith('image/') ? DbMediaType.IMAGE :
            file.mimetype.startsWith('video/') ? DbMediaType.VIDEO : DbMediaType.DOCUMENT,
      url: uploadResult.url,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    return this.reportMediaRepository.save(media);
  }

  async submit(reportId: string, currentUser: User): Promise<Report> {
    const report = await this.findOne(reportId, currentUser);
    report.status = DbReportStatus.UNDER_REVIEW;
    report.submittedAt = new Date();
    return this.reportRepository.save(report);
  }

  async review(reportId: string, status: string, currentUser: User): Promise<Report> {
    if (currentUser.role !== DbRole.ADMIN && currentUser.role !== DbRole.PROJECT_MANAGER) {
      throw new ForbiddenException('Only admins and project managers can review reports');
    }

    const report = await this.findOne(reportId, currentUser);
    report.status = toDbReportStatus(status);
    report.reviewedAt = new Date();
    report.reviewedById = currentUser.id;
    return this.reportRepository.save(report);
  }

  async update(id: string, data: any, currentUser: User): Promise<Report> {
    const report = await this.findOne(id, currentUser);
    if (report.status === DbReportStatus.APPROVED) {
      throw new BadRequestException('Cannot update approved report');
    }

    Object.assign(report, data);
    return this.reportRepository.save(report);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const report = await this.findOne(id, currentUser);
    await this.reportRepository.remove(report);
  }

  async removeMedia(mediaId: string, currentUser: User): Promise<void> {
    const media = await this.reportMediaRepository.findOne({
      where: { id: mediaId },
      relations: ['report'],
    });

    if (!media) throw new NotFoundException('Media not found');

    if (currentUser.role === DbRole.FIELD_OPS && media.report.createdById !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.reportMediaRepository.remove(media);
  }
}

