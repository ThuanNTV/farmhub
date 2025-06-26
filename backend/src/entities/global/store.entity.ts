import { PaperSize } from 'src/dto/dtoStores/create-store.dto';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  storeId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, name: 'database_name', unique: true })
  databaseName!: string;

  @Column({ type: 'varchar', length: 255, name: 'manager_id', nullable: true })
  managerId?: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'opening_hours',
    nullable: true,
  })
  openingHours?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // 🏦 Thông tin ngân hàng
  @Column({ type: 'varchar', name: 'bank_id', length: 100, nullable: true })
  bankId?: string;

  @Column({ type: 'varchar', name: 'account_no', length: 100, nullable: true })
  accountNo?: string;

  @Column({
    type: 'varchar',
    name: 'account_name',
    length: 255,
    nullable: true,
  })
  accountName?: string;

  // 🧾 VAT
  @Column({ type: 'boolean', name: 'is_vat_enabled', default: false })
  isVatEnabled!: boolean;

  @Column({ type: 'int', name: 'vat_rate', default: 8 })
  vatRate!: number;

  // 🧾 In hoá đơn
  @Column({
    type: 'varchar',
    name: 'invoice_footer',
    length: 500,
    nullable: true,
  })
  invoiceFooter?: string;

  @Column({
    type: 'enum',
    enum: PaperSize,
    name: 'default_paper_size',
    default: PaperSize.k80,
  })
  defaultPaperSize!: PaperSize;

  // 💾 Backup
  @Column({
    type: 'varchar',
    name: 'backup_schedule',
    length: 100,
    nullable: true,
  })
  backupSchedule?: string;

  // ⚙️ Cấu hình mặc định
  @Column({ type: 'varchar', name: 'default_unit', default: 'cái' })
  defaultUnit!: string;

  @Column({ type: 'int', name: 'default_discount', default: 0 })
  defaultDiscount!: number;

  @Column({ type: 'int', name: 'default_shipping_fee', default: 0 })
  defaultShippingFee!: number;
}
