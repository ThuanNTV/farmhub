import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  orderItemId!: string;

  @Column('uuid')
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column('uuid')
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 255 })
  productName!: string;

  @Column({ type: 'varchar', length: 50 })
  productUnit!: string;

  @Column({ type: 'int', unsigned: true })
  quantity!: number;

  @Column('decimal', { precision: 18, scale: 2, unsigned: true })
  unitPrice!: number;

  @Column('decimal', { precision: 18, scale: 2, unsigned: true })
  totalPrice!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  // Method to calculate total price
  calculateTotalPrice(): void {
    this.totalPrice = this.quantity * this.unitPrice;
  }
}
