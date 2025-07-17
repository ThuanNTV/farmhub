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
import { ReturnOrder } from './return_order.entity';
import { Product } from './product.entity';

@Entity('return_order_item')
export class ReturnOrderItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'returnOrderId' })
  return_order_id!: string;

  @ManyToOne(() => ReturnOrder, { nullable: false })
  @JoinColumn({ name: 'returnOrderId' })
  return_order!: ReturnOrder;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'unitPrice' })
  unit_price!: string;

  @Column({ type: 'varchar', length: 100, name: 'condition', nullable: true })
  condition?: string;

  @Column({ type: 'boolean', name: 'restocked', default: false })
  restocked!: boolean;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

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
