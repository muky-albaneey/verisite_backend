import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone, Project } from '../database/entities';
import { DbRole, DbMilestoneStatus, DbMilestoneName } from '../contracts';
import { toDbMilestoneStatus, toDbMilestoneName } from '../common/utils/enum-mapper';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findByProject(projectId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { projectId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    projectId: string,
    name: string,
    currentUser: any,
  ): Promise<Milestone> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const milestone = this.milestoneRepository.create({
      projectId,
      name: toDbMilestoneName(name),
      progress: 0,
      status: DbMilestoneStatus.PENDING,
    });

    return this.milestoneRepository.save(milestone);
  }

  async update(id: string, data: any): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({ where: { id } });
    if (!milestone) throw new NotFoundException('Milestone not found');

    if (data.progress !== undefined) milestone.progress = data.progress;
    if (data.status) milestone.status = toDbMilestoneStatus(data.status);
    if (data.expectedCompletion) milestone.expectedCompletion = data.expectedCompletion;
    if (data.budget !== undefined) milestone.budget = data.budget;
    if (data.dateStarted) milestone.dateStarted = data.dateStarted;
    if (data.dateCompleted) milestone.dateCompleted = data.dateCompleted;

    return this.milestoneRepository.save(milestone);
  }

  async remove(id: string): Promise<void> {
    const milestone = await this.milestoneRepository.findOne({ where: { id } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    await this.milestoneRepository.remove(milestone);
  }
}

