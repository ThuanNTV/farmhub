import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('loyalty_point_log')
@Index('IDX_loyalty_point_log_customer_id', ['customer_id'])
export class LoyaltyPointLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'customerId' })
  customer_id!: string;

  @Column({ type: 'uuid', name: 'orderId', nullable: true })
  order_id?: string;

  @Column({ type: 'int', name: 'change' })
  change!: number;

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
