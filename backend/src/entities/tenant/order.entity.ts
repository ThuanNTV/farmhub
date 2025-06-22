// order.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './orderItem.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DeliveryStatus {
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  OUTFORDELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILE = 'failed',
}
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  orderId!: string;

  @Column({ unique: true, length: 100 })
  orderCode!: string;

  @Column('uuid', { nullable: true })
  customerId?: string;

  @ManyToOne(() => Customer, (customer: Customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @Column('decimal', { precision: 18, scale: 2 })
  totalAmount!: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  discountAmount: number = 0;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  shippingFee: number = 0;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  totalPaid: number = 0;

  @Column({ length: 50 })
  paymentType!: string;

  @Column('text', { nullable: true })
  paymentDetails?: string;

  @Column({
    length: 50,
    default: OrderStatus.PENDING,
    enum: OrderStatus,
  })
  status!: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ length: 500 })
  deliveryAddress!: string;

  @Column({
    length: 50,
    default: DeliveryStatus.PROCESSING,
    enum: DeliveryStatus,
  })
  deliveryStatus!: DeliveryStatus;

  @Column('text', { nullable: true })
  note?: string;

  @Column('uuid', { nullable: true })
  processedByUserId?: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  orderItems!: OrderItem[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean = false;

  @BeforeInsert()
  generateOrderCode() {
    if (!this.orderCode) {
      const timestamp = Date.now().toString();
      this.orderCode = `ORD-${timestamp}`;
    }
  }
}
