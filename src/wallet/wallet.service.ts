import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletTransaction, User } from '../database/entities';
import { DbTransactionType, DbTransactionStatus } from '../contracts';
import { toDbTransactionType, toDbTransactionStatus } from '../common/utils/enum-mapper';
import { PaystackService } from '../paystack/paystack.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private paystackService: PaystackService,
  ) {}

  async getWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        balanceNgn: 0,
        verified: false,
      });
      wallet = await this.walletRepository.save(wallet);
    }

    return wallet;
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const wallet = await this.getWallet(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { transactions, total };
  }

  async initializeDeposit(userId: string, amount: number, email: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.getWallet(userId);
    const reference = `DEP_${userId}_${Date.now()}`;

    const paystackResponse = await this.paystackService.initializeTransaction({
      email: email || user.email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata: {
        userId,
        walletId: wallet.id,
      },
    });

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: DbTransactionType.DEPOSIT,
      amountNgn: amount,
      status: DbTransactionStatus.PENDING,
      title: 'Wallet Deposit',
      reference: paystackResponse.data.reference,
    });

    await this.transactionRepository.save(transaction);

    return {
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    };
  }

  async verifyDeposit(reference: string, userId: string) {
    const wallet = await this.getWallet(userId);
    const transaction = await this.transactionRepository.findOne({
      where: { reference, walletId: wallet.id },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status === DbTransactionStatus.COMPLETED) {
      return { message: 'Transaction already verified', transaction };
    }

    const verification = await this.paystackService.verifyTransaction(reference);

    if (verification.data.status === 'success') {
      transaction.status = DbTransactionStatus.COMPLETED;
      wallet.balanceNgn = Number(wallet.balanceNgn) + Number(transaction.amountNgn);
      await this.transactionRepository.save(transaction);
      await this.walletRepository.save(wallet);
    } else {
      transaction.status = DbTransactionStatus.FAILED;
      await this.transactionRepository.save(transaction);
    }

    return { transaction, wallet };
  }

  async requestWithdrawal(userId: string, amount: number, accountNumber: string, bankCode: string, bankName: string) {
    const wallet = await this.getWallet(userId);

    if (Number(wallet.balanceNgn) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      type: DbTransactionType.WITHDRAWAL,
      amountNgn: amount,
      status: DbTransactionStatus.PENDING,
      title: 'Withdrawal Request',
      subtitle: `${bankName} - ${accountNumber}`,
    });

    // Lock the amount (deduct from balance)
    wallet.balanceNgn = Number(wallet.balanceNgn) - amount;
    await this.walletRepository.save(wallet);
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  async getBanks() {
    return this.paystackService.getBanks();
  }

  async verifyAccount(accountNumber: string, bankCode: string) {
    return this.paystackService.verifyAccount(accountNumber, bankCode);
  }
}

