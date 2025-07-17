import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DispatchOrder } from './dispatch_order.entity';
import { Product } from './product.entity';

@Entity('dispatch_order_item')
export class DispatchOrderItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'dispatchOrderId' })
  dispatch_order_id!: string;

  @ManyToOne(() => DispatchOrder, { nullable: false })
  @JoinColumn({ name: 'dispatchOrderId' })
  dispatch_order!: DispatchOrder;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'unitPrice',
    nullable: true,
  })
  unit_price?: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'totalPrice',
    nullable: true,
  })
  total_price?: string;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
