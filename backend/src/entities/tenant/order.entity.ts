import { Index } from 'typeorm';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Customer } from 'src/entities/tenant/customer.entity';
import { OrderItem } from 'src/entities/tenant/orderItem.entity';

export enum DebtStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

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

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid', { name: 'orderId' })
  orderId!: string;

  @Column({ type: 'varchar', length: 100, name: 'orderCode', unique: true })
  orderCode!: string;

  @Index('IDX_order_code', ['orderCode'], { unique: true })
  @Column({ type: 'uuid', name: 'customerId', nullable: true })
  customerId?: string;

  @ManyToOne(() => Customer, (customer: Customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'totalAmount' })
  totalAmount!: number;

  @Index()
  @Column({ type: 'timestamp', name: 'invoiceIssuedAt', nullable: true })
  invoiceIssuedAt?: Date;

  @Index()
  @Column({ type: 'timestamp', name: 'accountingExportedAt', nullable: true })
  accountingExportedAt?: Date;

  @Column({ type: 'boolean', name: 'isCreditOrder', default: false })
  isCreditOrder!: boolean;

  @Index()
  @Column({
    type: 'enum',
    enum: DebtStatus,
    name: 'debtStatus',
    default: DebtStatus.UNPAID,
  })
  debtStatus!: DebtStatus;

  @Index()
  @Column({ type: 'timestamp', name: 'dueDate', nullable: true })
  dueDate?: Date;

  @Column({ type: 'varchar', length: 50, name: 'paymentTerms', nullable: true })
  paymentTerms?: string;

  @Index()
  @Column({ type: 'uuid', name: 'cashierId', nullable: true })
  cashierId?: string;

  @Index()
  @Column({ type: 'varchar', length: 50, name: 'terminalId', nullable: true })
  terminalId?: string;

  @Index()
  @Column({ type: 'varchar', length: 50, name: 'shiftId', nullable: true })
  shiftId?: string;

  @Column({ type: 'varchar', length: 100, name: 'posLocation', nullable: true })
  posLocation?: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'vatAmount',
    default: 0,
  })
  vatAmount!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'totalPaid',
    default: 0,
  })
  totalPaid!: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'paymentMethodId',
    nullable: true,
  })
  paymentMethodId?: string;

  @Column({ type: 'text', name: 'paymentDetails', nullable: true })
  paymentDetails?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    name: 'status',
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'timestamp', name: 'expectedDeliveryDate', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ type: 'varchar', length: 500, name: 'deliveryAddress' })
  deliveryAddress!: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    name: 'deliveryStatus',
    default: DeliveryStatus.PROCESSING,
  })
  deliveryStatus!: DeliveryStatus;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'invoiceNumber',
    nullable: true,
  })
  invoiceNumber?: string;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'uuid', name: 'processedByUserId', nullable: true })
  processedByUserId?: string;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  createdByUserId?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updatedByUserId?: string;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt?: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  orderItems!: OrderItem[];

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}
