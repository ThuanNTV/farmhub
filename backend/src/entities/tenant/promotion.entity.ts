import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BOGO = 'bogo',
}

@Entity('promotion')
export class Promotion {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
    name: 'type',
  })
  type!: PromotionType;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'value' })
  value!: string;

  @Column({ type: 'varchar', length: 50, name: 'appliesTo' })
  applies_to!: string; // all, category, product

  @Column({ type: 'date', name: 'startDate' })
  start_date!: Date;

  @Column({ type: 'date', name: 'endDate' })
  end_date!: Date;

  @Column({ type: 'boolean', name: 'isActive', default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @Column({ type: 'uuid', name: 'createdByUserId' })
  created_by_user_id!: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
