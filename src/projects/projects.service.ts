import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Project, User, Assignment, Milestone } from '../database/entities';
import { CreateProjectDto, UpdateProjectDto, AssignDeveloperDto, RejectProjectDto } from './dto';
import {
  DbRole,
  DbProjectStatus,
  DbDeveloperAcceptanceStatus,
  ApiProjectStatus,
} from '../contracts';
import { toApiProjectStatus, toDbProjectStatus } from '../common/utils/enum-mapper';
import { UploadService, UploadFolder } from '../upload/upload.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private uploadService: UploadService,
  ) {}

  async create(dto: CreateProjectDto, currentUser: User): Promise<Project> {
    // Only clients and admins can create projects
    if (currentUser.role !== DbRole.CLIENT && currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only clients can create projects');
    }

    const project = this.projectRepository.create({
      ...dto,
      clientId: currentUser.role === DbRole.ADMIN ? dto['clientId'] || currentUser.id : currentUser.id,
      status: DbProjectStatus.PENDING_REVIEW,
      progress: 0,
      developerAcceptanceStatus: DbDeveloperAcceptanceStatus.PENDING,
    });

    return this.projectRepository.save(project);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    clientId?: string,
    developerId?: string,
    currentUser: User = null,
  ): Promise<{ projects: Project[]; total: number }> {
    const query = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.developer', 'developer')
      .leftJoinAndSelect('project.fieldOps', 'fieldOps');

    if (search) {
      query.where('project.name ILIKE :search OR project.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      query.andWhere('project.status = :status', { status: toDbProjectStatus(status) });
    }

    if (clientId) {
      query.andWhere('project.clientId = :clientId', { clientId });
    }

    if (developerId) {
      query.andWhere('project.developerId = :developerId', { developerId });
    }

    // Access control
    if (currentUser) {
      if (currentUser.role === DbRole.CLIENT) {
        query.andWhere('project.clientId = :userId', { userId: currentUser.id });
      } else if (currentUser.role === DbRole.DEVELOPER) {
        query.andWhere('project.developerId = :userId', { userId: currentUser.id });
      } else if (currentUser.role === DbRole.FIELD_OPS) {
        query.andWhere('project.fieldOpsId = :userId', { userId: currentUser.id });
      }
    }

    const skip = (page - 1) * limit;
    const [projects, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { projects, total };
  }

  async findOne(id: string, currentUser: User = null): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client', 'developer', 'fieldOps', 'images', 'assignments', 'milestones'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Access control
    if (currentUser) {
      if (currentUser.role === DbRole.CLIENT && project.clientId !== currentUser.id) {
        throw new ForbiddenException('Access denied');
      }
      if (currentUser.role === DbRole.DEVELOPER && project.developerId !== currentUser.id) {
        throw new ForbiddenException('Access denied');
      }
      if (currentUser.role === DbRole.FIELD_OPS && project.fieldOpsId !== currentUser.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, currentUser: User): Promise<Project> {
    const project = await this.findOne(id, currentUser);

    // Only client or admin can update
    if (currentUser.role !== DbRole.ADMIN && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Only project owner can update');
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const project = await this.findOne(id, currentUser);

    // Only client can delete if no developer assigned
    if (currentUser.role !== DbRole.ADMIN && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Only project owner can delete');
    }

    if (project.developerId) {
      throw new BadRequestException('Cannot delete project with assigned developer');
    }

    await this.projectRepository.softDelete(id);
  }

  async assignDeveloper(
    id: string,
    dto: AssignDeveloperDto,
    currentUser: User,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser);

    // Only client or admin can assign
    if (currentUser.role !== DbRole.ADMIN && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Only project owner can assign developer');
    }

    const developer = await this.userRepository.findOne({
      where: { id: dto.developerId, role: DbRole.DEVELOPER },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    project.developerId = dto.developerId;
    project.developerAcceptanceStatus = DbDeveloperAcceptanceStatus.PENDING;
    return this.projectRepository.save(project);
  }

  async acceptProject(id: string, currentUser: User): Promise<Project> {
    const project = await this.findOne(id, currentUser);

    // Only developer can accept
    if (currentUser.role !== DbRole.DEVELOPER || project.developerId !== currentUser.id) {
      throw new ForbiddenException('Only assigned developer can accept');
    }

    project.developerAcceptanceStatus = DbDeveloperAcceptanceStatus.ACCEPTED;
    project.developerAcceptedAt = new Date();
    project.status = DbProjectStatus.ONGOING;
    return this.projectRepository.save(project);
  }

  async rejectProject(
    id: string,
    dto: RejectProjectDto,
    currentUser: User,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser);

    // Only developer can reject
    if (currentUser.role !== DbRole.DEVELOPER || project.developerId !== currentUser.id) {
      throw new ForbiddenException('Only assigned developer can reject');
    }

    project.developerAcceptanceStatus = DbDeveloperAcceptanceStatus.REJECTED;
    project.developerRejectedAt = new Date();
    project.developerRejectionReason = dto.reason;
    project.developerId = null;
    return this.projectRepository.save(project);
  }

  async getStats(currentUser: User): Promise<any> {
    const query = this.projectRepository.createQueryBuilder('project');

    // Access control
    if (currentUser.role === DbRole.CLIENT) {
      query.where('project.clientId = :userId', { userId: currentUser.id });
    } else if (currentUser.role === DbRole.DEVELOPER) {
      query.where('project.developerId = :userId', { userId: currentUser.id });
    } else if (currentUser.role === DbRole.FIELD_OPS) {
      query.where('project.fieldOpsId = :userId', { userId: currentUser.id });
    }

    const total = await query.getCount();
    const ongoing = await query
      .andWhere('project.status = :status', { status: DbProjectStatus.ONGOING })
      .getCount();
    const completed = await query
      .andWhere('project.status = :status', { status: DbProjectStatus.COMPLETED })
      .getCount();
    const pending = await query
      .andWhere('project.status = :status', { status: DbProjectStatus.PENDING_REVIEW })
      .getCount();

    return {
      total,
      ongoing,
      completed,
      pending,
    };
  }
}

