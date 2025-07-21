import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductVariantAttribute } from './product_variant_attribute.entity';

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  COLOR = 'color',
  SIZE = 'size',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

export enum AttributeInputType {
  TEXT = 'text',
  NUMBER = 'number',
  COLOR_PICKER = 'color_picker',
  DROPDOWN = 'dropdown',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
}

@Entity('product_attribute')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['is_active', 'is_deleted'])
export class ProductAttribute {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'attribute_id' })
  attribute_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'name', unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  display_name!: string;

  @Column({ type: 'varchar', length: 500, name: 'description', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    name: 'type',
    default: AttributeType.TEXT,
  })
  type!: AttributeType;

  @Column({
    type: 'enum',
    enum: AttributeInputType,
    name: 'input_type',
    default: AttributeInputType.TEXT,
  })
  input_type!: AttributeInputType;

  @Column({ type: 'json', name: 'options', nullable: true })
  options?: {
    values?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      pattern?: string;
      minLength?: number;
      maxLength?: number;
    };
  };

  @Column({ type: 'varchar', length: 100, name: 'unit', nullable: true })
  unit?: string;

  @Column({ type: 'boolean', name: 'is_required', default: false })
  is_required!: boolean;

  @Column({ type: 'boolean', name: 'is_variant_defining', default: true })
  is_variant_defining!: boolean;

  @Column({ type: 'boolean', name: 'is_filterable', default: true })
  is_filterable!: boolean;

  @Column({ type: 'boolean', name: 'is_searchable', default: false })
  is_searchable!: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sort_order!: number;

  @Column({ type: 'varchar', length: 100, name: 'group_name', nullable: true })
  group_name?: string;

  @Column({ type: 'text', name: 'help_text', nullable: true })
  help_text?: string;

  @Column({ type: 'varchar', length: 255, name: 'default_value', nullable: true })
  default_value?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  is_deleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ type: 'uuid', name: 'created_by_user_id', nullable: true })
  created_by_user_id?: string;

  @Column({ type: 'uuid', name: 'updated_by_user_id', nullable: true })
  updated_by_user_id?: string;

  // Relations
  @OneToMany(() => ProductVariantAttribute, (variantAttribute) => variantAttribute.attribute)
  variant_attributes!: ProductVariantAttribute[];
}
