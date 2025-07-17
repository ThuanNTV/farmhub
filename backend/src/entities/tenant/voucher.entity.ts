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

export enum VoucherType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  SHIPPING = 'shipping',
}

@Entity('voucher')
export class Voucher {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'int', name: 'pointsCost' })
  points_cost!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'value' })
  value!: string;

  @Column({
    type: 'enum',
    enum: VoucherType,
    name: 'type',
  })
  type!: VoucherType;

  @Column({ type: 'varchar', length: 255, name: 'code', unique: true })
  code!: string;

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
