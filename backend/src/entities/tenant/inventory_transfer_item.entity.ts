import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('inventory_transfer_item')
export class InventoryTransferItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'transferId' })
  transfer_id!: string;

  @Column({ type: 'uuid', name: 'productId' })
  product_id!: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
    name: 'unitPrice',
    nullable: true,
  })
  unit_price?: number;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;
}
