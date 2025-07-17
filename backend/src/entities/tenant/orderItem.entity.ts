import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { Exclude } from 'class-transformer';

@Entity('order_item')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid', { name: 'orderItemId' })
  order_item_id!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  order_id!: string;

  @ManyToOne(() => Order, (order) => order.order_items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false, eager: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 255, name: 'productName' })
  product_name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'productUnitId',
    nullable: true,
  })
  product_unit_id?: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'unitPrice' })
  unit_price!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'totalPrice' })
  total_price!: number;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
