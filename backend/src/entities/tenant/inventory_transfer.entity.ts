import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('inventory_transfer')
export class InventoryTransfer {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'sourceStoreId' })
  source_store_id!: string;

  @Column({ type: 'uuid', name: 'targetStoreId' })
  target_store_id!: string;

  @Column({ type: 'varchar', length: 100, name: 'transferCode', unique: true })
  transfer_code!: string;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled'],
    name: 'status',
    default: 'pending',
  })
  status!: 'pending' | 'completed' | 'cancelled';

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'approvedByUserId', nullable: true })
  approved_by_user_id?: string;

  @Column({ type: 'uuid', name: 'receivedByUserId', nullable: true })
  received_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @Column({ type: 'timestamp', name: 'approvedAt', nullable: true })
  approved_at?: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;
}
