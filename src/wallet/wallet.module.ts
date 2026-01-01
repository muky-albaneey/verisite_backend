import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet, WalletTransaction, User } from '../database/entities';
import { PaystackModule } from '../paystack/paystack.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction, User]), PaystackModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}

