import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { AuditMetadata } from 'src/common/types/common.types';

@Entity('audit_log')
@Index('IDX_audit_log_user_id', ['user_id'])
@Index('IDX_audit_log_target_table', ['target_table'])
@Index('IDX_audit_log_store_id', ['store_id'])
@Index('IDX_audit_log_created_at', ['created_at'])
@Index('IDX_audit_log_action', ['action'])
@Index('IDX_audit_log_composite', ['store_id', 'target_table', 'created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ type: 'varchar', length: 100 })
  target_table!: string;

  @Column({ type: 'uuid' })
  target_id!: string;

  @Column({ type: 'uuid' })
  store_id!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_name?: string;

  @Column({ type: 'json', nullable: true })
  old_value?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  new_value?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata?: AuditMetadata;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by_user_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;
}
