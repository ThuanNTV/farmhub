import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum DispatchOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('dispatch_order')
export class DispatchOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'dispatchCode' })
  dispatch_code!: string;

  @Column({ type: 'varchar', length: 255, name: 'purpose', nullable: true })
  purpose?: string;

  @Column({
    type: 'enum',
    enum: DispatchOrderStatus,
    name: 'status',
    default: DispatchOrderStatus.PENDING,
  })
  status!: DispatchOrderStatus;

  @Column({ type: 'uuid', name: 'createdByUserId' })
  created_by_user_id!: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
