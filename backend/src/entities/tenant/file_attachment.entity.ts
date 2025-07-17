import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('file_attachment')
@Index(['entity_type', 'entity_id'])
@Index(['uploaded_by_user_id'])
@Index(['is_deleted'])
export class FileAttachment {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'varchar', length: 100, name: 'entityType' })
  @Index()
  entity_type!: string;

  @Column({ type: 'uuid', name: 'entityId' })
  entity_id!: string;

  @Column({ type: 'text', name: 'fileUrl' })
  file_url!: string;

  @Column({ type: 'uuid', name: 'uploadedByUserId', nullable: true })
  uploaded_by_user_id?: string;

  @Column({ type: 'varchar', length: 255, name: 'note', nullable: true })
  note?: string;

  @Column({ type: 'boolean', name: 'isDeleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'createdByUserId', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
