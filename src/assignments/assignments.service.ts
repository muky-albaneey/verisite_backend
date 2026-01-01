import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment, Project, User } from '../database/entities';
import { DbRole, DbAssignmentStatus, DbMilestoneName } from '../contracts';
import { toDbAssignmentStatus, toDbMilestoneName } from '../common/utils/enum-mapper';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(projectId: string, fieldOpsId: string, milestone: string, currentUser: User) {
    if (currentUser.role !== DbRole.ADMIN && currentUser.role !== DbRole.PROJECT_MANAGER) {
      throw new ForbiddenException('Only admins and project managers can create assignments');
    }

    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const fieldOps = await this.userRepository.findOne({
      where: { id: fieldOpsId, role: DbRole.FIELD_OPS },
    });
    if (!fieldOps) throw new NotFoundException('Field ops user not found');

    const assignment = this.assignmentRepository.create({
      projectId,
      fieldOpsId,
      milestone: toDbMilestoneName(milestone),
      status: DbAssignmentStatus.PENDING,
      assignedDate: new Date(),
      progressPercent: 0,
      adminId: currentUser.role === DbRole.ADMIN ? currentUser.id : undefined,
    });

    return this.assignmentRepository.save(assignment);
  }

  async findAll(currentUser: User) {
    const query = this.assignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.project', 'project')
      .leftJoinAndSelect('assignment.fieldOps', 'fieldOps');

    if (currentUser.role === DbRole.FIELD_OPS) {
      query.where('assignment.fieldOpsId = :userId', { userId: currentUser.id });
    }

    return query.getMany();
  }

  async findOne(id: string, currentUser: User) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['project', 'fieldOps', 'admin'],
    });

    if (!assignment) throw new NotFoundException('Assignment not found');

    if (currentUser.role === DbRole.FIELD_OPS && assignment.fieldOpsId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return assignment;
  }

  async updateStatus(id: string, status: string, currentUser: User) {
    const assignment = await this.findOne(id, currentUser);
    assignment.status = toDbAssignmentStatus(status);
    return this.assignmentRepository.save(assignment);
  }
}

