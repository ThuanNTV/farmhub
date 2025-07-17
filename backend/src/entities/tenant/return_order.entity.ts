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
import { Customer } from './customer.entity';

export enum ReturnOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('return_order')
export class ReturnOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  order_id!: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'uuid', name: 'customerId' })
  customer_id!: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column({ type: 'datetime', name: 'returnDate' })
  return_date!: Date;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'totalRefundAmount',
  })
  total_refund_amount!: string;

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason?: string;

  @Column({
    type: 'enum',
    enum: ReturnOrderStatus,
    name: 'status',
    default: ReturnOrderStatus.PENDING,
  })
  status!: ReturnOrderStatus;

  @Column({ type: 'uuid', name: 'processedByUserId', nullable: true })
  processed_by_user_id?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
