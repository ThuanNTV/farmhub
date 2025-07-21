import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantAttribute } from './product_variant_attribute.entity';

@Entity('product_variant')
@Index(['product_id'])
@Index(['sku'], { unique: true })
@Index(['is_active', 'is_deleted'])
export class ProductVariant {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'variant_id' })
  variant_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'product_id' })
  product_id!: string;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar', length: 255, name: 'sku', unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 500, name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'price_retail' })
  price_retail!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'price_wholesale',
    nullable: true,
  })
  price_wholesale?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'cost_price',
    nullable: true,
  })
  cost_price?: number;

  @Column({ type: 'varchar', length: 50, name: 'barcode', nullable: true })
  barcode?: string;

  @Column({ type: 'int', name: 'stock', default: 0 })
  stock!: number;

  @Column({ type: 'int', name: 'min_stock_level', default: 0 })
  min_stock_level!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'weight', nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 50, name: 'weight_unit', nullable: true })
  weight_unit?: string;

  @Column({ type: 'json', name: 'dimensions', nullable: true })
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  @Column({ type: 'text', name: 'images', nullable: true })
  images?: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sort_order!: number;

  @Column({ type: 'boolean', name: 'is_default', default: false })
  is_default!: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updated_by_user_id', nullable: true })
  updated_by_user_id?: string;

  // Relations
  @OneToMany(() => ProductVariantAttribute, (attribute) => attribute.variant)
  attributes!: ProductVariantAttribute[];
}
