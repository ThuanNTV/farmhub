import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  productId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  productCode!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'varchar', length: 255 })
  categoryId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  creditPrice?: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 0 })
  minStockLevel!: number;

  @Column({ type: 'text', nullable: true })
  images?: string; // JSON.stringify([...])

  @Column({ type: 'text', nullable: true })
  specs?: string; // JSON.stringify({ key: value })

  @Column({ type: 'varchar', length: 255, nullable: true })
  warrantyInfo?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierId?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;
}
