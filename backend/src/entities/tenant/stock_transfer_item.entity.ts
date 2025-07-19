import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockTransfer } from 'src/entities/tenant/stock_transfer.entity';
import { Product } from 'src/entities/tenant/product.entity';

@Entity('stock_transfer_item')
export class StockTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'store_id', type: 'uuid' })
  storeId!: string;

  @Column({ name: 'stock_transfer_id', type: 'uuid' })
  stockTransferId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({
    name: 'transferred_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  transferredQuantity!: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  unitPrice?: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalPrice?: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Relations
  @ManyToOne(() => StockTransfer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_transfer_id' })
  stockTransfer!: StockTransfer;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
