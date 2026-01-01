import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities';
import { ApiRole } from '../contracts';
import { toApiEscrowStatus } from '../common/utils/enum-mapper';

@ApiTags('Escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get escrow statistics' })
  async getStats(@CurrentUser() user: User) {
    const stats = await this.escrowService.getStats(user);
    return { data: stats };
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get escrow transfers' })
  async getTransfers(@CurrentUser() user: User) {
    const transfers = await this.escrowService.getTransfers(user);
    return { data: transfers.map((t) => this.serializeTransfer(t)) };
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Get escrow withdrawals' })
  async getWithdrawals(@CurrentUser() user: User) {
    const withdrawals = await this.escrowService.getWithdrawals(user);
    return { data: withdrawals.map((w) => this.serializeWithdrawal(w)) };
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Create escrow transfer' })
  async createTransfer(
    @CurrentUser() user: User,
    @Body('projectId') projectId: string,
    @Body('transferToUserId') transferToUserId: string,
    @Body('transferTo') transferTo: string,
    @Body('amount') amount: number,
  ) {
    const transfer = await this.escrowService.createTransfer(
      projectId,
      transferToUserId,
      transferTo,
      amount,
      user,
    );
    return { transfer: this.serializeTransfer(transfer) };
  }

  @Post('withdrawals')
  @ApiOperation({ summary: 'Create escrow withdrawal' })
  async createWithdrawal(
    @CurrentUser() user: User,
    @Body('projectId') projectId: string,
    @Body('bankName') bankName: string,
    @Body('accountNo') accountNo: string,
    @Body('amount') amount: number,
  ) {
    const withdrawal = await this.escrowService.createWithdrawal(
      projectId,
      bankName,
      accountNo,
      amount,
      user,
    );
    return { withdrawal: this.serializeWithdrawal(withdrawal) };
  }

  @Patch('transfers/:id/approve')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Approve transfer (Admin only)' })
  async approveTransfer(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const transfer = await this.escrowService.approveTransfer(id, user);
    return { transfer: this.serializeTransfer(transfer) };
  }

  @Patch('transfers/:id/reject')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Reject transfer (Admin only)' })
  async rejectTransfer(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const transfer = await this.escrowService.rejectTransfer(id, user);
    return { transfer: this.serializeTransfer(transfer) };
  }

  @Patch('withdrawals/:id/approve')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Approve withdrawal (Admin only)' })
  async approveWithdrawal(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const withdrawal = await this.escrowService.approveWithdrawal(id, user);
    return { withdrawal: this.serializeWithdrawal(withdrawal) };
  }

  @Patch('withdrawals/:id/reject')
  @Roles(ApiRole.ADMIN)
  @ApiOperation({ summary: 'Reject withdrawal (Admin only)' })
  async rejectWithdrawal(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const withdrawal = await this.escrowService.rejectWithdrawal(id, user);
    return { withdrawal: this.serializeWithdrawal(withdrawal) };
  }

  private serializeTransfer(transfer: any) {
    return {
      id: transfer.id,
      projectId: transfer.projectId,
      transferToUserId: transfer.transferToUserId,
      transferTo: transfer.transferTo,
      amount: transfer.amount,
      dateSent: transfer.dateSent,
      status: toApiEscrowStatus(transfer.status),
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
    };
  }

  private serializeWithdrawal(withdrawal: any) {
    return {
      id: withdrawal.id,
      projectId: withdrawal.projectId,
      bankName: withdrawal.bankName,
      accountNo: withdrawal.accountNo,
      amount: withdrawal.amount,
      date: withdrawal.date,
      status: toApiEscrowStatus(withdrawal.status),
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
    };
  }
}

