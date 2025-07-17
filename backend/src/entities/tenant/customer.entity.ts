import { Order } from 'src/entities/tenant/order.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('customer')
@Index(['name'])
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'customerId' })
  customer_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 20, name: 'phone', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, name: 'email', nullable: true })
  email?: string;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address?: string;

  @Column({ type: 'varchar', name: 'taxCode', nullable: true })
  tax_code?: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'customerType',
    default: 'retail',
  })
  customer_type!: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
    name: 'gender',
    nullable: true,
  })
  gender?: 'male' | 'female' | 'other';

  @Column({ type: 'date', name: 'birthday', nullable: true })
  birthday?: Date;

  @Column({ type: 'varchar', length: 100, name: 'refCode', nullable: true })
  ref_code?: string;

  @Column({ type: 'varchar', length: 255, name: 'note', nullable: true })
  note?: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'creditLimit',
    nullable: true,
  })
  credit_limit?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'totalDebt',
    nullable: true,
  })
  total_debt?: number;

  @Column({ type: 'date', name: 'debtDueDate', nullable: true })
  debt_due_date?: Date;

  @Column({ type: 'date', name: 'lastPurchaseDate', nullable: true })
  last_purchase_date?: Date;

  @Column({ type: 'varchar', length: 50, name: 'status', nullable: true })
  status?: string;

  @Column({ type: 'boolean', name: 'isActive', default: true })
  is_active!: boolean;

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

  @OneToMany(() => Order, (order: Order) => order.customer)
  orders!: Order[];
}
