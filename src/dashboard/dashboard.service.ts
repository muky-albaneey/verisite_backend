import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Project, Assignment, Report, Wallet, WalletTransaction } from '../database/entities';
import { DbRole, DbProjectStatus, DbAssignmentStatus, DbReportStatus } from '../contracts';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
  ) {}

  async getStats(currentUser: User) {
    if (currentUser.role === DbRole.ADMIN) {
      return this.getAdminStats();
    } else if (currentUser.role === DbRole.FIELD_OPS) {
      return this.getFieldOpsStats(currentUser.id);
    } else if (currentUser.role === DbRole.CLIENT) {
      return this.getClientStats(currentUser.id);
    } else if (currentUser.role === DbRole.DEVELOPER) {
      return this.getDeveloperStats(currentUser.id);
    }

    return {};
  }

  private async getAdminStats() {
    const totalUsers = await this.userRepository.count();
    const totalProjects = await this.projectRepository.count();
    const totalAssignments = await this.assignmentRepository.count();
    const totalReports = await this.reportRepository.count();
    const pendingReports = await this.reportRepository.count({
      where: { status: DbReportStatus.PENDING },
    });
    const ongoingProjects = await this.projectRepository.count({
      where: { status: DbProjectStatus.ONGOING },
    });

    return {
      totalUsers,
      totalProjects,
      totalAssignments,
      totalReports,
      pendingReports,
      ongoingProjects,
    };
  }

  private async getFieldOpsStats(userId: string) {
    const totalAssignments = await this.assignmentRepository.count({
      where: { fieldOpsId: userId },
    });

    const pendingAssignments = await this.assignmentRepository.count({
      where: { fieldOpsId: userId, status: DbAssignmentStatus.PENDING },
    });

    const ongoingAssignments = await this.assignmentRepository.count({
      where: { fieldOpsId: userId, status: DbAssignmentStatus.ONGOING },
    });

    const completedAssignments = await this.assignmentRepository.count({
      where: { fieldOpsId: userId, status: DbAssignmentStatus.COMPLETED },
    });

    const totalReports = await this.reportRepository.count({
      where: { createdById: userId },
    });

    const pendingReports = await this.reportRepository.count({
      where: { createdById: userId, status: DbReportStatus.PENDING },
    });

    return {
      totalAssignments,
      pendingAssignments,
      ongoingAssignments,
      completedAssignments,
      totalReports,
      pendingReports,
    };
  }

  private async getClientStats(userId: string) {
    const totalProjects = await this.projectRepository.count({
      where: { clientId: userId },
    });

    const ongoingProjects = await this.projectRepository.count({
      where: { clientId: userId, status: DbProjectStatus.ONGOING },
    });

    const completedProjects = await this.projectRepository.count({
      where: { clientId: userId, status: DbProjectStatus.COMPLETED },
    });

    const wallet = await this.walletRepository.findOne({ where: { userId } });
    const balance = wallet ? wallet.balanceNgn : 0;

    return {
      totalProjects,
      ongoingProjects,
      completedProjects,
      walletBalance: balance,
    };
  }

  private async getDeveloperStats(userId: string) {
    const totalProjects = await this.projectRepository.count({
      where: { developerId: userId },
    });

    const ongoingProjects = await this.projectRepository.count({
      where: { developerId: userId, status: DbProjectStatus.ONGOING },
    });

    const completedProjects = await this.projectRepository.count({
      where: { developerId: userId, status: DbProjectStatus.COMPLETED },
    });

    return {
      totalProjects,
      ongoingProjects,
      completedProjects,
    };
  }

  async getRecentAssignments(currentUser: User, limit: number = 5) {
    const query = this.assignmentRepository.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.project', 'project')
      .orderBy('assignment.createdAt', 'DESC')
      .take(limit);

    if (currentUser.role === DbRole.FIELD_OPS) {
      query.where('assignment.fieldOpsId = :userId', { userId: currentUser.id });
    }

    return query.getMany();
  }
}

