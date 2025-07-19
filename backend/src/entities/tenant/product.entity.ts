import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from 'src/entities/tenant/category.entity';
import { GlobalEntityService } from 'src/service/global-entity.service';
import { Unit } from 'src/entities/global/unit.entity';

@Entity('product')
@Index(['name'])
@Index('IDX_category_id', ['category_id'])
@Index('IDX_unit_id', ['unit_id'])
@Index('IDX_product_code', ['productCode'], { unique: true })
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'productId' })
  product_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'productCode', unique: true })
  product_code!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', length: 255, name: 'description' })
  description!: string;

  @Column({ type: 'varchar', length: 255, name: 'categoryId' })
  category_id!: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column({ type: 'varchar', length: 100, name: 'brand', nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 50, name: 'unitId', nullable: true })
  unit_id?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'priceRetail' })
  price_retail!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'priceWholesale',
    nullable: true,
  })
  price_wholesale?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'creditPrice',
    nullable: true,
  })
  credit_price?: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'costPrice',
    nullable: true,
  })
  cost_price?: number;

  @Column({ type: 'varchar', length: 50, name: 'barcode', nullable: true })
  barcode?: string;

  @Column({ type: 'int', name: 'stock', default: 0 })
  stock!: number;

  @Column({ type: 'int', name: 'minStockLevel', default: 0 })
  min_stock_level!: number;

  @Column({ type: 'text', name: 'images', nullable: true })
  images?: string;

  @Column({ type: 'text', name: 'specs', nullable: true })
  specs?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'warrantyInfo',
    nullable: true,
  })
  warranty_info?: string;

  @Column({ type: 'varchar', length: 255, name: 'supplierId', nullable: true })
  supplier_id?: string;

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

  /**
   * Helper method để lấy Unit data từ global database
   * @param globalEntityService - Service để access global entities
   * @returns Unit entity hoặc null nếu không tìm thấy
   */
  async getUnit(
    globalEntityService: GlobalEntityService,
  ): Promise<Unit | null> {
    if (!this.unit_id) return null;
    return await globalEntityService.getUnitById(this.unit_id);
  }

  /**
   * Helper method để lấy User data từ global database
   * @param globalEntityService - Service để access global entities
   * @returns User entity hoặc null nếu không tìm thấy
   */
  async getCreatedByUser(globalEntityService: GlobalEntityService) {
    if (!this.created_by_user_id) return null;
    return await globalEntityService.getUserById(this.created_by_user_id);
  }

  /**
   * Helper method để lấy User data từ global database
   * @param globalEntityService - Service để access global entities
   * @returns User entity hoặc null nếu không tìm thấy
   */
  async getUpdatedByUser(globalEntityService: GlobalEntityService) {
    if (!this.updated_by_user_id) return null;
    return await globalEntityService.getUserById(this.updated_by_user_id);
  }
}
