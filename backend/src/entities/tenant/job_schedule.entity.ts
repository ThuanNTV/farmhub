import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum JobScheduleStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ACTIVE = 'ACTIVE',
}

@Entity('job_schedule')
export class JobSchedule {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ type: 'uuid', name: 'storeId' })
  store_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'jobName' })
  job_name!: string;

  @Column({ type: 'varchar', length: 255, name: 'schedule' })
  schedule!: string;

  @Column({ type: 'datetime', name: 'lastRunAt', nullable: true })
  last_run_at?: Date;

  @Column({ type: 'datetime', name: 'nextRunAt', nullable: true })
  next_run_at?: Date;

  @Column({
    type: 'enum',
    enum: JobScheduleStatus,
    name: 'status',
    default: JobScheduleStatus.SCHEDULED,
  })
  status!: JobScheduleStatus;

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

  @Column({ type: 'uuid', name: 'createdByUserId' })
  created_by_user_id!: string;

  @Column({ type: 'uuid', name: 'updatedByUserId', nullable: true })
  updated_by_user_id?: string;
}
