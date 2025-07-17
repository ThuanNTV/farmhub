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
import { Product } from './product.entity';

export enum StockAdjustmentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('stock_adjustment')
export class StockAdjustment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 50, name: 'adjustmentType' })
  adjustment_type!: string; // increase, decrease

  @Column({ type: 'int', name: 'quantityChange' })
  quantity_change!: number;

  @Column({ type: 'text', name: 'reason', nullable: true })
  reason?: string;

  @Column({
    type: 'enum',
    enum: StockAdjustmentStatus,
    name: 'status',
    default: StockAdjustmentStatus.PENDING,
  })
  status!: StockAdjustmentStatus;

  @Column({ type: 'uuid', name: 'adjustedByUserId' })
  adjusted_by_user_id!: string;

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

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
