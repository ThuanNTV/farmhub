import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('category')
@Index(['name'])
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'categoryId' })
  category_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, name: 'parentId', nullable: true })
  parent_id?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @Column({ type: 'varchar', length: 500, name: 'image', nullable: true })
  image?: string;

  @Column({ type: 'int', name: 'displayOrder', default: 0 })
  display_order!: number;

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
}
