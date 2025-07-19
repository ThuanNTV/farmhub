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
export class AuditLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' }) id!: string;

  @Column({ type: 'uuid', name: 'userId' }) user_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'action' }) action!: string;

  @Column({ type: 'varchar', length: 100, name: 'targetTable' })
  target_table!: string;

  @Column({ type: 'uuid', name: 'targetId' })
  target_id!: string;

  @Column({ type: 'json', name: 'metadata', nullable: true })
  metadata?: AuditMetadata;

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

  // Bổ sung các property cho entity AuditLog
  device!: string;
  browser!: string;
  os!: string;
  user_name!: string;
  resource_type!: string;
  resource_id!: string;
  old_value!: string | null;
  new_value!: string | null;
  ip_address!: string;
  user_agent!: string;
  timestamp!: Date;
  store_id!: string;
  session_id!: string;
  details!: string | null;
  audit_log_id!: string;
}
