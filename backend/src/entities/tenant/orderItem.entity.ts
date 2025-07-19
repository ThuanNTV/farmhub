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
import { Order } from 'src/entities/tenant/order.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { Exclude } from 'class-transformer';

@Entity('order_item')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid', { name: 'orderItemId' })
  orderItemId!: string;

  @Column({ type: 'uuid', name: 'orderId' })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'uuid', name: 'productId' })
  productId!: string;

  @ManyToOne(() => Product, { nullable: false, eager: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 255, name: 'productName' })
  productName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'productUnitId',
    nullable: true,
  })
  productUnitId?: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'unitPrice' })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'totalPrice' })
  totalPrice!: number;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  createdByUserId?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updatedByUserId?: string;
}
