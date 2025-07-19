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
  order_id!: string;

  @Column({ type: 'varchar', length: 100, name: 'orderCode', unique: true })
  order_code!: string;

  @Index('IDX_order_code', ['order_code'], { unique: true })
  @Column({ type: 'uuid', name: 'customerId', nullable: true })
  customer_id?: string;

  @ManyToOne(() => Customer, (customer: Customer) => customer.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'totalAmount' })
  total_amount!: number;

  // --- Tài chính & Kế toán ---
  @Index()
  @Column({ type: 'timestamp', name: 'invoiceIssuedAt', nullable: true })
  invoice_issued_at?: Date;

  @Index()
  @Column({ type: 'timestamp', name: 'accountingExportedAt', nullable: true })
  accounting_exported_at?: Date;

  // --- Bán buôn / Công nợ ---
  @Column({ type: 'boolean', name: 'isCreditOrder', default: false })
  is_credit_order!: boolean;

  @Index()
  @Column({
    type: 'enum',
    enum: DebtStatus,
    name: 'debtStatus',
    default: DebtStatus.UNPAID,
  })
  debt_status!: DebtStatus;

  @Index()
  @Column({ type: 'timestamp', name: 'dueDate', nullable: true })
  due_date?: Date;

  @Column({ type: 'varchar', length: 50, name: 'paymentTerms', nullable: true })
  payment_terms?: string;

  // --- POS hiện đại / trực tiếp ---
  @Index()
  @Column({ type: 'uuid', name: 'cashierId', nullable: true })
  cashier_id?: string;

  @Index()
  @Column({ type: 'varchar', length: 50, name: 'terminalId', nullable: true })
  terminal_id?: string;

  @Index()
  @Column({ type: 'varchar', length: 50, name: 'shiftId', nullable: true })
  shift_id?: string;

  @Column({ type: 'varchar', length: 100, name: 'posLocation', nullable: true })
  pos_location?: string;
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'vatAmount',
    default: 0,
  })
  vat_amount!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'totalPaid',
    default: 0,
  })
  total_paid!: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'paymentMethodId',
    nullable: true,
  })
  payment_method_id?: string;

  @Column({ type: 'text', name: 'paymentDetails', nullable: true })
  payment_details?: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    name: 'status',
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'timestamp', name: 'expectedDeliveryDate', nullable: true })
  expected_delivery_date?: Date;

  @Column({ type: 'varchar', length: 500, name: 'deliveryAddress' })
  delivery_address!: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    name: 'deliveryStatus',
    default: DeliveryStatus.PROCESSING,
  })
  delivery_status!: DeliveryStatus;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'invoiceNumber',
    nullable: true,
  })
  invoice_number?: string;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'uuid', name: 'processedByUserId', nullable: true })
  processed_by_user_id?: string;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  order_items!: OrderItem[];

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;
}
