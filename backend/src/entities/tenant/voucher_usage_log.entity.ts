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
import { Voucher } from './voucher.entity';
import { Order } from './order.entity';

@Entity('voucher_usage_log')
export class VoucherUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: string;

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId?: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount!: number;

  @Column({
    name: 'order_total_before_discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  orderTotalBeforeDiscount!: number;

  @Column({
    name: 'order_total_after_discount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  orderTotalAfterDiscount!: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  // Relations
  @ManyToOne(() => Voucher)
  @JoinColumn({ name: 'voucher_id' })
  voucher!: Voucher;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order;
}
