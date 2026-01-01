import { Controller, Get, Post, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto, createPaginationMeta } from '../common/dto/pagination.dto';
import { toApiTransactionStatus, toApiTransactionType } from '../common/utils/enum-mapper';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance' })
  async getWallet(@CurrentUser() user: any) {
    const wallet = await this.walletService.getWallet(user.id);
    return {
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        balanceNgn: wallet.balanceNgn,
        verified: wallet.verified,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(@Query() pagination: PaginationDto, @CurrentUser() user: any) {
    const { transactions, total } = await this.walletService.getTransactions(
      user.id,
      pagination.page,
      pagination.limit,
    );

    return {
      data: transactions.map((t) => ({
        id: t.id,
        walletId: t.walletId,
        type: toApiTransactionType(t.type),
        amountNgn: t.amountNgn,
        status: toApiTransactionStatus(t.status),
        title: t.title,
        subtitle: t.subtitle,
        method: t.method,
        reference: t.reference,
        createdAt: t.createdAt,
      })),
      meta: createPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Initialize deposit (Paystack)' })
  async initializeDeposit(
    @Body('amount') amount: number,
    @Body('email') email: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.walletService.initializeDeposit(user.id, amount, email);
    return result;
  }

  @Post('deposit/verify')
  @ApiOperation({ summary: 'Verify deposit transaction' })
  async verifyDeposit(@Body('reference') reference: string, @CurrentUser() user: any) {
    const result = await this.walletService.verifyDeposit(reference, user.id);
    return result;
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request withdrawal' })
  async requestWithdrawal(
    @Body('amount') amount: number,
    @Body('accountNumber') accountNumber: string,
    @Body('bankCode') bankCode: string,
    @Body('bankName') bankName: string,
    @CurrentUser() user: any,
  ) {
    const transaction = await this.walletService.requestWithdrawal(
      user.id,
      amount,
      accountNumber,
      bankCode,
      bankName,
    );
    return { transaction };
  }

  @Get('cards')
  @ApiOperation({ summary: 'Get bank cards (placeholder)' })
  async getCards() {
    return { data: [] };
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get list of banks (Paystack)' })
  async getBanks() {
    const banks = await this.walletService.getBanks();
    return { data: banks };
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verify bank account (Paystack)' })
  async verifyAccount(
    @Body('accountNumber') accountNumber: string,
    @Body('bankCode') bankCode: string,
  ) {
    const result = await this.walletService.verifyAccount(accountNumber, bankCode);
    return { data: result };
  }
}

