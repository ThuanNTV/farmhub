import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('external_system_log')
export class ExternalSystemLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 255, name: 'systemName' })
  system_name!: string;

  @Column({ type: 'varchar', length: 255, name: 'endpoint' })
  endpoint!: string;

  @Column({ type: 'text', name: 'requestData' })
  request_data!: string;

  @Column({ type: 'text', name: 'responseData', nullable: true })
  response_data?: string;

  @Column({ type: 'varchar', length: 50, name: 'status' })
  status!: string;

  @Column({ type: 'int', name: 'responseTime', nullable: true })
  response_time?: number;

  @Column({ type: 'text', name: 'errorMessage', nullable: true })
  error_message?: string;

  @Column({ type: 'varchar', length: 45, name: 'ipAddress', nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 255, name: 'userAgent', nullable: true })
  user_agent?: string;

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
