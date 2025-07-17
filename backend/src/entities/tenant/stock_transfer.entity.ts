import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('stock_transfer')
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: string;

  @Column({ name: 'transfer_code', type: 'varchar', length: 50, unique: true })
  transferCode!: string;

  @Column({ name: 'from_store_id', type: 'uuid' })
  fromStoreId!: string;

  @Column({ name: 'to_store_id', type: 'uuid' })
  toStoreId!: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status!: string; // pending, in_progress, completed, cancelled

  @Column({ name: 'transfer_date', type: 'timestamp' })
  transferDate!: Date;

  @Column({ name: 'expected_delivery_date', type: 'timestamp', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ name: 'actual_delivery_date', type: 'timestamp', nullable: true })
  actualDeliveryDate?: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'total_items', type: 'int', default: 0 })
  totalItems!: number;

  @Column({
    name: 'total_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalQuantity!: number;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId?: string;

  @Column({ name: 'updated_by_user_id', type: 'uuid', nullable: true })
  updatedByUserId?: string;

  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
