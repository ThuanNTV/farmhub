import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bank } from './bank.entity';
import { User } from './user.entity';
import { PaperSize } from 'src/modules/stores/dto/create-store.dto';

@Entity('store')
@Index(['schema_name'], { unique: true })
@Index('IDX_bank_id', ['bank_id'])
@Index('IDX_manager_user_id', ['manager_user_id'])
export class Store {
  @PrimaryGeneratedColumn('uuid', { name: 'storeId' })
  store_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 500, name: 'address' })
  address!: string;

  @Column({ type: 'varchar', length: 20, name: 'phone' })
  phone!: string;

  @Column({ type: 'varchar', length: 255, name: 'email', nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, name: 'schemaName', unique: true })
  schema_name!: string;

  @Column({ type: 'uuid', name: 'managerUserId', nullable: true })
  manager_user_id?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerUserId' })
  manager_user?: User;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'openingHours',
    nullable: true,
  })
  opening_hours?: string;

  @Column({ type: 'boolean', default: true, name: 'isActive' })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false, name: 'isDeleted' })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updated_at!: Date;

  @Column({ type: 'varchar', name: 'bankId', length: 50, nullable: true })
  bank_id?: string;

  @ManyToOne(() => Bank, { nullable: true })
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @Column({ type: 'varchar', name: 'accountNo', length: 100, nullable: true })
  account_no?: string;

  @Column({
    type: 'varchar',
    name: 'accountName',
    length: 255,
    nullable: true,
  })
  account_name?: string;

  @Column({ type: 'boolean', name: 'isVatEnabled', default: false })
  is_vat_enabled!: boolean;

  @Column({ type: 'int', name: 'vatRate', default: 8 })
  vat_rate!: number;

  @Column({
    type: 'varchar',
    name: 'invoiceFooter',
    length: 500,
    nullable: true,
  })
  invoice_footer?: string;

  @Column({
    type: 'enum',
    enum: PaperSize,
    name: 'defaultPaperSize',
    default: PaperSize.k80,
  })
  default_paper_size!: PaperSize;

  @Column({
    type: 'varchar',
    name: 'backupSchedule',
    length: 100,
    nullable: true,
  })
  backup_schedule?: string;

  @Column({
    type: 'varchar',
    name: 'defaultUnitId',
    length: 50,
    nullable: true,
  })
  default_unit_id?: string;

  @Column({ type: 'int', name: 'defaultDiscount', default: 0 })
  default_discount!: number;

  @Column({ type: 'int', name: 'defaultShippingFee', default: 0 })
  default_shipping_fee!: number;
}
