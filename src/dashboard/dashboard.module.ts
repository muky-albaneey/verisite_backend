import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User, Project, Assignment, Report, Wallet, WalletTransaction } from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, Assignment, Report, Wallet, WalletTransaction]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

