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
}
