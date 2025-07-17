import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('supplier')
export class Supplier {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 20, name: 'phone', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, name: 'email', nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 500, name: 'address', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 50, name: 'taxCode', nullable: true })
  tax_code?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'contactPerson',
    nullable: true,
  })
  contact_person?: string;

  @Column({ type: 'text', name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
