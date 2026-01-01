import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { EscrowTransfer, EscrowWithdrawal, Project, User } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowTransfer, EscrowWithdrawal, Project, User])],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}

