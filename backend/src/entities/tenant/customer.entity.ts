import { Order } from 'src/entities/tenant/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  customerId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ nullable: true })
  taxCode?: string;

  @Column({ default: 'retail' }) // Mặc định là 'retail' (khách lẻ)
  customerType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  creditLimit?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  totalDebt?: number;

  @Column({ type: 'date', nullable: true })
  debtDueDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastPurchaseDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => Order, (order: Order) => order.customer)
  orders!: Order[];
}
