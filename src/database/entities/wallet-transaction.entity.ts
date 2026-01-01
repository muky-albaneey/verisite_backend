import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { DbTransactionStatus, DbTransactionType } from '../../contracts';

@Entity('wallet_transactions')
@Index(['walletId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: DbTransactionType,
    enumName: 'transaction_type_enum',
  })
  type: DbTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountNgn: number;

  @Column({
    type: 'enum',
    enum: DbTransactionStatus,
    enumName: 'transaction_status_enum',
    default: DbTransactionStatus.PENDING,
  })
  status: DbTransactionStatus;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ nullable: true })
  method?: string;

  @Column({ nullable: true })
  reference?: string;

  @CreateDateColumn()
  createdAt: Date;
}

