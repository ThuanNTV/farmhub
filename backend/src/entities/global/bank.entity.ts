import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank')
export class Bank {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  created_by_user_id!: string;

  @Column({ type: 'uuid', name: 'updated_by_user_id', nullable: true })
  updated_by_user_id?: string;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  is_deleted!: boolean;
}
