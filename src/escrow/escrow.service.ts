import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EscrowTransfer, EscrowWithdrawal, Project, User } from '../database/entities';
import { DbRole, DbEscrowStatus } from '../contracts';
import { toDbEscrowStatus } from '../common/utils/enum-mapper';

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowTransfer)
    private transferRepository: Repository<EscrowTransfer>,
    @InjectRepository(EscrowWithdrawal)
    private withdrawalRepository: Repository<EscrowWithdrawal>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async getStats(currentUser: User) {
    const query = this.transferRepository.createQueryBuilder('transfer')
      .leftJoin('transfer.project', 'project');

    if (currentUser.role === DbRole.CLIENT) {
      query.where('project.clientId = :userId', { userId: currentUser.id });
    }

    const total = await query.getCount();
    const pending = await query.clone()
      .andWhere('transfer.status = :status', { status: DbEscrowStatus.PENDING })
      .getCount();
    const approved = await query.clone()
      .andWhere('transfer.status = :status', { status: DbEscrowStatus.APPROVED })
      .getCount();

    return { total, pending, approved };
  }

  async getTransfers(currentUser: User) {
    const query = this.transferRepository.createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.project', 'project')
      .leftJoinAndSelect('transfer.transferToUser', 'transferToUser');

    if (currentUser.role === DbRole.CLIENT) {
      query.where('project.clientId = :userId', { userId: currentUser.id });
    }

    return query.getMany();
  }

  async getWithdrawals(currentUser: User) {
    const query = this.withdrawalRepository.createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.project', 'project');

    if (currentUser.role === DbRole.CLIENT) {
      query.where('project.clientId = :userId', { userId: currentUser.id });
    }

    return query.getMany();
  }

  async createTransfer(
    projectId: string,
    transferToUserId: string,
    transferTo: string,
    amount: number,
    currentUser: User,
  ): Promise<EscrowTransfer> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (currentUser.role === DbRole.CLIENT && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    const transfer = this.transferRepository.create({
      projectId,
      transferToUserId,
      transferTo,
      amount,
      status: DbEscrowStatus.PENDING,
    });

    return this.transferRepository.save(transfer);
  }

  async createWithdrawal(
    projectId: string,
    bankName: string,
    accountNo: string,
    amount: number,
    currentUser: User,
  ): Promise<EscrowWithdrawal> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (currentUser.role === DbRole.CLIENT && project.clientId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    const withdrawal = this.withdrawalRepository.create({
      projectId,
      bankName,
      accountNo,
      amount,
      status: DbEscrowStatus.PENDING,
    });

    return this.withdrawalRepository.save(withdrawal);
  }

  async approveTransfer(id: string, currentUser: User): Promise<EscrowTransfer> {
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can approve transfers');
    }

    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    transfer.status = DbEscrowStatus.APPROVED;
    transfer.dateSent = new Date();
    return this.transferRepository.save(transfer);
  }

  async rejectTransfer(id: string, currentUser: User): Promise<EscrowTransfer> {
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can reject transfers');
    }

    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) throw new NotFoundException('Transfer not found');

    transfer.status = DbEscrowStatus.REJECTED;
    return this.transferRepository.save(transfer);
  }

  async approveWithdrawal(id: string, currentUser: User): Promise<EscrowWithdrawal> {
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can approve withdrawals');
    }

    const withdrawal = await this.withdrawalRepository.findOne({ where: { id } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    withdrawal.status = DbEscrowStatus.APPROVED;
    withdrawal.date = new Date();
    return this.withdrawalRepository.save(withdrawal);
  }

  async rejectWithdrawal(id: string, currentUser: User): Promise<EscrowWithdrawal> {
    if (currentUser.role !== DbRole.ADMIN) {
      throw new ForbiddenException('Only admins can reject withdrawals');
    }

    const withdrawal = await this.withdrawalRepository.findOne({ where: { id } });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    withdrawal.status = DbEscrowStatus.REJECTED;
    return this.withdrawalRepository.save(withdrawal);
  }
}

