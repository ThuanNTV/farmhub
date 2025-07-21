import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_seo')
@Index(['product_id'], { unique: true })
@Index(['slug'], { unique: true })
@Index(['is_active'])
export class ProductSeo {
  @PrimaryColumn({ type: 'varchar', length: 255, name: 'seo_id' })
  seo_id!: string;

  @Column({ type: 'varchar', length: 255, name: 'product_id', unique: true })
  product_id!: string;

  @OneToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'varchar', length: 255, name: 'slug', unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 255, name: 'seo_title', nullable: true })
  seo_title?: string;

  @Column({ type: 'text', name: 'seo_description', nullable: true })
  seo_description?: string;

  @Column({ type: 'json', name: 'seo_keywords', nullable: true })
  seo_keywords?: string[];

  @Column({
    type: 'varchar',
    length: 500,
    name: 'canonical_url',
    nullable: true,
  })
  canonical_url?: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'meta_robots',
    nullable: true,
    default: 'index,follow',
  })
  meta_robots?: string;

  @Column({ type: 'json', name: 'hreflang_tags', nullable: true })
  hreflang_tags?: Record<string, string>;

  @Column({ type: 'json', name: 'custom_meta_tags', nullable: true })
  custom_meta_tags?: Array<{
    name: string;
    content: string;
    property?: string;
  }>;

  @Column({ type: 'json', name: 'open_graph_data', nullable: true })
  open_graph_data?: {
    title: string;
    description: string;
    type: string;
    image: string;
    url: string;
    siteName?: string;
    locale?: string;
  };

  @Column({ type: 'json', name: 'twitter_card_data', nullable: true })
  twitter_card_data?: {
    card: string;
    title: string;
    description: string;
    image: string;
    site?: string;
    creator?: string;
  };

  @Column({ type: 'json', name: 'structured_data', nullable: true })
  structured_data?: Array<{
    '@type': string;
    '@context': string;
    data: Record<string, any>;
  }>;

  @Column({ type: 'json', name: 'schema_markup', nullable: true })
  schema_markup?: Record<string, any>;

  @Column({ type: 'json', name: 'seo_analysis', nullable: true })
  seo_analysis?: {
    overallScore: number;
    titleAnalysis: {
      score: number;
      length: number;
      hasKeywords: boolean;
      suggestions: string[];
    };
    descriptionAnalysis: {
      score: number;
      length: number;
      hasKeywords: boolean;
      suggestions: string[];
    };
    keywordAnalysis: {
      score: number;
      density: number;
      distribution: Record<string, number>;
      suggestions: string[];
    };
    imageAnalysis: {
      score: number;
      hasAltText: boolean;
      optimizedSize: boolean;
      suggestions: string[];
    };
    structuredDataAnalysis: {
      score: number;
      hasProductSchema: boolean;
      hasOfferSchema: boolean;
      suggestions: string[];
    };
    recommendations: string[];
    analyzedAt: Date;
  };

  @Column({
    type: 'varchar',
    length: 50,
    name: 'sitemap_change_freq',
    nullable: true,
    default: 'weekly',
  })
  sitemap_change_freq?: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    name: 'sitemap_priority',
    nullable: true,
    default: 0.8,
  })
  sitemap_priority?: number;

  @Column({ type: 'boolean', name: 'sitemap_include', default: true })
  sitemap_include!: boolean;

  @Column({ type: 'json', name: 'sitemap_images', nullable: true })
  sitemap_images?: Array<{
    url: string;
    caption?: string;
    title?: string;
  }>;

  @Column({ type: 'int', name: 'view_count', default: 0 })
  view_count!: number;

  @Column({ type: 'int', name: 'click_count', default: 0 })
  click_count!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    name: 'ctr',
    nullable: true,
  })
  ctr?: number;

  @Column({ type: 'json', name: 'search_console_data', nullable: true })
  search_console_data?: {
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    lastUpdated: Date;
  };

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
}
