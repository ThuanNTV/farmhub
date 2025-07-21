import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from 'src/entities/tenant/product.entity';

@Entity('price_history')
@Index('IDX_product_id', ['product_id'])
@Index('IDX_changed_by_user_id', ['changed_by_user_id'])
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'oldPrice' })
  old_price!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'newPrice' })
  new_price!: number;

  @Column({
    type: 'enum',
    enum: ['retail', 'wholesale', 'credit', 'cost'],
    name: 'priceType',
    default: 'retail',
  })
  price_type!: 'retail' | 'wholesale' | 'credit' | 'cost';

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'priceDifference',
    nullable: true,
  })
  price_difference?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'percentageChange',
    nullable: true,
  })
  percentage_change?: number;

  @Column({ type: 'varchar', length: 500, name: 'reason', nullable: true })
  reason?: string;

  @Column({ type: 'json', name: 'metadata', nullable: true })
  metadata?: {
    source?: string; // 'manual', 'bulk_update', 'api', 'import'
    batch_id?: string; // For bulk operations
    supplier_price_change?: boolean;
    market_adjustment?: boolean;
    promotion?: boolean;
    cost_increase?: boolean;
    [key: string]: any;
  };

  @Column({ type: 'uuid', name: 'changedByUserId', nullable: true })
  changed_by_user_id?: string;

  @CreateDateColumn({ name: 'changedAt' })
  changed_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  // Computed properties
  get isIncrease(): boolean {
    return this.new_price > this.old_price;
  }

  get isDecrease(): boolean {
    return this.new_price < this.old_price;
  }

  get absoluteChange(): number {
    return Math.abs(this.price_difference || 0);
  }

  get formattedPercentageChange(): string {
    if (!this.percentage_change) return '0%';
    const sign = this.percentage_change > 0 ? '+' : '';
    return `${sign}${this.percentage_change.toFixed(2)}%`;
  }
}
