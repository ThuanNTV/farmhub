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
import { Order } from 'src/entities/tenant/order.entity';

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  LATE = 'late',
  REFUND = 'refund',
  CANCELED = 'canceled',
}

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  order_id!: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount!: string;

  @Column({ type: 'datetime', name: 'paidAt', nullable: true })
  paid_at?: Date;

  @Column({ type: 'varchar', length: 50, name: 'paymentMethodId' })
  payment_method_id!: string;

  @Column({ type: 'uuid', name: 'paidByUserId', nullable: true })
  paid_by_user_id?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    name: 'status',
    default: PaymentStatus.UNPAID,
  })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

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
}
