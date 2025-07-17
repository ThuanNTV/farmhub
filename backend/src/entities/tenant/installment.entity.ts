import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum InstallmentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  LATE = 'late',
}

@Entity('installment')
export class Installment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  order_id!: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'int', name: 'installmentNumber' })
  installment_number!: number;

  @Column({ type: 'datetime', name: 'dueDate' })
  due_date!: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount!: string;

  @Column({ type: 'datetime', name: 'paidAt', nullable: true })
  paid_at?: Date;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'paymentMethodId',
    nullable: true,
  })
  payment_method_id?: string;

  @Column({ type: 'uuid', name: 'collectedByUserId', nullable: true })
  collected_by_user_id?: string;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @Column({
    type: 'enum',
    enum: InstallmentStatus,
    name: 'status',
    default: InstallmentStatus.UNPAID,
  })
  status!: InstallmentStatus;

  @Column({ type: 'varchar', length: 255, name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;
}
