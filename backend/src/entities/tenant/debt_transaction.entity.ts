import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum DebtTransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

@Entity('debt_transaction')
export class DebtTransaction {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'customerId' })
  customer_id!: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount!: string;

  @Column({ type: 'varchar', length: 50, name: 'paymentMethodId' })
  payment_method_id!: string;

  @Column({ type: 'uuid', name: 'paidByUserId' })
  paid_by_user_id!: string;

  @Column({ type: 'datetime', name: 'paidAt' })
  paid_at!: Date;

  @Column({
    type: 'enum',
    enum: DebtTransactionStatus,
    name: 'status',
    default: DebtTransactionStatus.PENDING,
  })
  status!: DebtTransactionStatus;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
