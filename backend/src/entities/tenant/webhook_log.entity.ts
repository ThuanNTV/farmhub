import { WebhookPayload } from 'src/common/types/common.types';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum WebhookType {
  OUTGOING = 'outgoing',
  INCOMING = 'incoming',
}

@Entity('webhook_log')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'storeId' })
  store_id!: string;

  @Column({
    type: 'enum',
    enum: WebhookType,
    name: 'type',
  })
  type!: WebhookType;

  @Column({ type: 'varchar', length: 100, name: 'eventType' })
  event_type!: string;

  @Column({ type: 'json', name: 'payload' })
  payload!: WebhookPayload;

  @Column({ type: 'int', name: 'statusCode', nullable: true })
  status_code?: number;

  @Column({ type: 'text', name: 'response', nullable: true })
  response?: string;

  @Column({ type: 'boolean', name: 'isSuccess' })
  is_success!: boolean;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deleted_at?: Date;
}
