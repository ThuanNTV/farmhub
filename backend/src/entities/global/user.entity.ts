import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('user')
@Index(['user_name'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'userId' })
  user_id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'userName',
    unique: true,
    nullable: true,
  })
  user_name?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'passwordHash',
    nullable: true,
  })
  password_hash?: string;

  @Column({ type: 'varchar', length: 255, name: 'fullName', nullable: true })
  full_name?: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'phone' })
  phone?: string;

  @Column({ type: 'varchar', length: 50, name: 'role', nullable: true })
  role?: string; // e.g. admin_global, store_manager

  @Column({ type: 'boolean', default: true, name: 'isActive', nullable: true })
  is_active?: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'isDeleted',
    nullable: true,
  })
  is_deleted?: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'isSuperadmin',
    nullable: true,
  })
  is_superadmin?: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'lastLoginAt' })
  last_login_at?: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'passwordResetToken',
  })
  password_reset_token?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'tokenExpiryAt' })
  token_expiry_at?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updated_at!: Date;
}
