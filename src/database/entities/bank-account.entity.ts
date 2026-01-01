import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum PaymentMethodType {
  CARD = 'CARD',
  ACCOUNT = 'ACCOUNT',
}

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  bankName: string;

  @Column()
  bankCode: string;

  @Column({ type: 'text' })
  accountNumberEncrypted: string;

  @Column()
  masked: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    enumName: 'payment_method_type_enum',
  })
  type: PaymentMethodType;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

