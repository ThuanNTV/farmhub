import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product_variant.entity';
import { ProductAttribute } from './product_attribute.entity';

@Entity('product_variant_attribute')
@Index(['variant_id', 'attribute_id'], { unique: true })
@Index(['variant_id'])
@Index(['attribute_id'])
export class ProductVariantAttribute {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'variant_attribute_id' })
  variant_attribute_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'variant_id' })
  variant_id!: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.attributes, {
    nullable: false,
  })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;

  @Column({ type: 'varchar', length: 255, name: 'attribute_id' })
  attribute_id!: string;

  @ManyToOne(() => ProductAttribute, { nullable: false })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;

  @Column({ type: 'varchar', length: 500, name: 'value' })
  value!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'display_value',
    nullable: true,
  })
  display_value?: string;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sort_order!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updated_by_user_id', nullable: true })
  updated_by_user_id?: string;
}
