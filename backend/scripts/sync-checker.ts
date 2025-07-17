#!/usr/bin/env ts-node

/**
 * 🔍 FarmHub Sync Checker
 * Kiểm tra độ đồng bộ giữa DTO - Entity - Mapper - Controller - Swagger
 */

import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface SyncIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
}

interface DomainCheck {
  domain: string;
  entityFile?: string;
  dtoFiles: string[];
  controllerFile?: string;
  serviceFile?: string;
  moduleFile?: string;
  issues: SyncIssue[];
}

class SyncChecker {
  private issues: SyncIssue[] = [];
  private domains: Map<string, DomainCheck> = new Map();

  constructor() {
    Logger.log('🔍 FarmHub Sync Checker Starting...');
  }

  async run(): Promise<void> {
    try {
      await this.scanProject();
      await this.checkEntities();
      await this.checkDTOs();
      await this.checkControllers();
      await this.checkServices();
      await this.checkModules();
      await this.checkSwagger();
      this.generateReport();
    } catch (error) {
      Logger.error('❌ Error during sync check:', error);
      process.exit(1);
    }
  }

  private async scanProject(): Promise<void> {
    Logger.log('📁 Scanning project structure...');

    // Scan entities
    const entityFiles = this.findFiles('src/entities', '*.entity.ts');
    for (const file of entityFiles) {
      const domain = this.normalizeDomainName(this.extractDomain(file));
      if (!this.domains.has(domain)) {
        this.domains.set(domain, {
          domain,
          dtoFiles: [],
          issues: [],
        });
      }
      this.domains.get(domain)!.entityFile = file;
    }

    // Scan DTOs with improved domain extraction and matching (handle plural/singular)
    const dtoDirs = fs
      .readdirSync('src/dto')
      .filter((d) => d.startsWith('dto'));

    // Map of domain -> dtoDir
    const dtoDomainMap: Record<string, string> = {};
    for (const dtoDir of dtoDirs) {
      // Extract domain name from dtoX directory (handle plural/singular)
      let domain = this.normalizeDomainName(
        this.extractDomainFromDtoDir(dtoDir),
      );
      dtoDomainMap[domain] = dtoDir;
      // Also try plural and singular forms
      if (domain.endsWith('s')) {
        const singular = domain.replace(/s$/, '');
        dtoDomainMap[this.normalizeDomainName(singular)] = dtoDir;
      } else {
        dtoDomainMap[this.normalizeDomainName(domain + 's')] = dtoDir;
      }
      // Special case: y -> ies (category -> categories)
      if (domain.endsWith('y')) {
        dtoDomainMap[this.normalizeDomainName(domain.replace(/y$/, 'ies'))] =
          dtoDir;
      }
      if (domain.endsWith('ies')) {
        dtoDomainMap[this.normalizeDomainName(domain.replace(/ies$/, 'y'))] =
          dtoDir;
      }
    }
    // Debug: print DTO domain map
    if (process.env.DEBUG_SYNC_CHECKER) {
      Logger.log('🔍 DTO Directory Domain Map:');
      for (const [d, dir] of Object.entries(dtoDomainMap)) {
        Logger.log(`  ${d} -> ${dir}`);
      }
    }
    // Now scan all DTO files and assign to domains
    for (const [domain, dtoDir] of Object.entries(dtoDomainMap)) {
      const dtoPath = path.join('src/dto', dtoDir);
      const dtoFiles = this.findFiles(dtoPath, '*.dto.ts');
      const normalizedDomain = this.normalizeDomainName(domain);

      // Check if we already have a similar domain (e.g., price_historie vs price_histories)
      let targetDomain = normalizedDomain;
      if (!this.domains.has(normalizedDomain)) {
        // Try to find a similar domain that might already exist
        const similarDomain = this.findSimilarDomain(normalizedDomain);
        if (similarDomain) {
          targetDomain = similarDomain;
        } else {
          this.domains.set(normalizedDomain, {
            domain: normalizedDomain,
            dtoFiles: [],
            issues: [],
          });
        }
      }
      this.domains.get(targetDomain)!.dtoFiles.push(...dtoFiles);
    }

    // Scan controllers and services using flexible pattern matching
    for (const [domain, check] of this.domains) {
      // Find controller file
      const controllerFile = this.findFileByPattern(
        'controller',
        domain,
        'controller.ts',
      );
      if (controllerFile) {
        check.controllerFile = controllerFile;
      }

      // Find service file
      const serviceFile = this.findFileByPattern(
        'service',
        domain,
        'service.ts',
      );
      if (serviceFile) {
        check.serviceFile = serviceFile;
      }
    }

    // Scan modules using flexible pattern matching
    for (const [domain, check] of this.domains) {
      const moduleFile = this.findFileByPattern('module', domain, 'module.ts');
      if (moduleFile) {
        check.moduleFile = moduleFile;
      }
    }

    Logger.log(`✅ Found ${this.domains.size} domains`);

    // Debug: Show domain mappings
    if (process.env.DEBUG_SYNC_CHECKER) {
      Logger.log('🔍 Domain Mappings:');
      for (const [domain, check] of this.domains) {
        Logger.log(`  ${domain}:`);
        Logger.log(`    Entity: ${check.entityFile ?? 'None'}`);
        Logger.log(`    DTOs: ${check.dtoFiles.length} files`);
        Logger.log(`    Controller: ${check.controllerFile ?? 'None'}`);
        Logger.log(`    Service: ${check.serviceFile ?? 'None'}`);
        Logger.log(`    Module: ${check.moduleFile ?? 'None'}`);
      }
    }
  }

  private findFiles(dir: string, pattern: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = this.findFiles(fullPath, pattern);
        files.push(...subFiles);
      } else if (stat.isFile() && this.matchesPattern(item, pattern)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    // So sánh không phân biệt hoa thường
    filename = filename.toLowerCase();
    pattern = pattern.toLowerCase();
    if (pattern === '*.entity.ts') {
      return filename.endsWith('.entity.ts');
    }
    if (pattern === '*.dto.ts') {
      return filename.endsWith('.dto.ts');
    }
    if (pattern === '*responsedto.ts') {
      return filename.includes('responsedto.ts');
    }
    if (pattern === '*.controller.ts') {
      return filename.endsWith('.controller.ts');
    }
    if (pattern === '*.service.ts') {
      return filename.endsWith('.service.ts');
    }
    if (pattern === '*.module.ts') {
      return filename.endsWith('.module.ts');
    }
    return false;
  }

  private findFileByPattern(
    folder: string,
    domain: string,
    suffix: string,
  ): string | undefined {
    const patterns = [
      `${domain}.${suffix}`,
      `${domain}s.${suffix}`,
      `${domain.replace(/_/g, '-')}.${suffix}`,
      `${domain.replace(/_/g, '-') + 's'}.${suffix}`,
      `*${domain}*.${suffix}`,
      `*${domain.replace(/_/g, '-')}*.${suffix}`,
      `*${domain.replace(/-/g, '_')}*.${suffix}`,
    ];

    // Thử thêm pattern cho cả số ít và số nhiều
    if (domain.endsWith('s')) {
      const singular = domain.replace(/s$/, '');
      patterns.unshift(`${singular}.${suffix}`);
      patterns.unshift(`${singular.replace(/_/g, '-')}.${suffix}`);
      patterns.unshift(`*${singular}*.${suffix}`);
      patterns.unshift(`*${singular.replace(/_/g, '-')}*.${suffix}`);
    } else {
      const plural = domain + 's';
      patterns.unshift(`${plural}.${suffix}`);
      patterns.unshift(`${plural.replace(/_/g, '-')}.${suffix}`);
      patterns.unshift(`*${plural}*.${suffix}`);
      patterns.unshift(`*${plural.replace(/_/g, '-')}*.${suffix}`);
    }

    // Handle special cases for common naming variations
    const specialCases = [
      // Handle categorys vs categories
      domain === 'category' ? 'categorys' : null,
      domain === 'categorys' ? 'category' : null,
      // Handle user-activity-log vs user-activity-logs
      domain === 'user-activity-log' ? 'user-activity-logs' : null,
      domain === 'user-activity-logs' ? 'user-activity-log' : null,
      // Handle voucher-usage-log vs voucher-usage-logs
      domain === 'voucher-usage-log' ? 'voucher-usage-logs' : null,
      domain === 'voucher-usage-logs' ? 'voucher-usage-log' : null,
    ].filter(Boolean);

    // Add special case patterns
    for (const specialCase of specialCases) {
      if (specialCase) {
        patterns.unshift(`${specialCase}.${suffix}`);
        patterns.unshift(`*${specialCase}*.${suffix}`);
      }
    }

    for (const pattern of patterns) {
      try {
        const files = glob.sync(`src/${folder}/${pattern}`);
        if (files.length > 0) {
          // Sort by relevance (exact match first, then partial matches)
          const sortedFiles = files.sort((a, b) => {
            const aName = path.basename(a, path.extname(a));
            const bName = path.basename(b, path.extname(b));

            // Exact match gets highest priority
            if (aName === domain) return -1;
            if (bName === domain) return 1;

            // Then exact match with suffix
            if (aName === `${domain}.${suffix.replace('.', '')}`) return -1;
            if (bName === `${domain}.${suffix.replace('.', '')}`) return 1;

            // Then length (shorter names preferred)
            return aName.length - bName.length;
          });

          if (process.env.DEBUG_SYNC_CHECKER) {
            Logger.log(
              `  Found ${folder} for ${domain}: ${sortedFiles[0]} (tried pattern: ${pattern})`,
            );
          }

          return sortedFiles[0];
        }
      } catch (error) {
        // Continue to next pattern if current one fails
        continue;
      }
    }

    if (process.env.DEBUG_SYNC_CHECKER) {
      Logger.log(
        `  No ${folder} found for ${domain} after trying ${patterns.length} patterns`,
      );
    }

    return undefined;
  }

  private findMatchingDomain(domain: string): string | null {
    const normalizedDomain = this.normalizeDomainName(domain);
    // Check exact match first
    if (this.domains.has(normalizedDomain)) {
      return normalizedDomain;
    }

    // Check for kebab-case vs snake_case variations
    const kebabVersion = this.normalizeDomainName(domain.replace(/_/g, '-'));
    const snakeVersion = this.normalizeDomainName(domain.replace(/-/g, '_'));

    if (this.domains.has(kebabVersion)) {
      return kebabVersion;
    }

    if (this.domains.has(snakeVersion)) {
      return snakeVersion;
    }

    // Check for plural variations
    const singularVersion = this.normalizeDomainName(domain.replace(/s$/, ''));
    const pluralVersion = this.normalizeDomainName(domain + 's');

    if (this.domains.has(singularVersion)) {
      return singularVersion;
    }

    if (this.domains.has(pluralVersion)) {
      return pluralVersion;
    }

    // Check for log vs logs variations
    const logVersion = this.normalizeDomainName(domain.replace(/logs$/, 'log'));
    const logsVersion = this.normalizeDomainName(
      domain.replace(/log$/, 'logs'),
    );

    if (this.domains.has(logVersion)) {
      return logVersion;
    }

    if (this.domains.has(logsVersion)) {
      return logsVersion;
    }

    return null;
  }

  private findSimilarDomain(domain: string): string | null {
    // Check for common variations that might cause duplicate domains
    // This should align with normalizeDomainName logic
    const variations = [
      // price_historie vs price_histories
      domain === 'price_historie' ? 'price_histories' : null,
      domain === 'price_histories' ? 'price_historie' : null,
      // category vs categories (including misspellings)
      domain === 'category' ? 'categories' : null,
      domain === 'categories' ? 'category' : null,
      domain === 'categorys' ? 'categories' : null,
      domain === 'categorie' ? 'categories' : null,
      // user vs users
      domain === 'user' ? 'users' : null,
      domain === 'users' ? 'user' : null,
      // product vs products
      domain === 'product' ? 'products' : null,
      domain === 'products' ? 'product' : null,
      // order vs orders
      domain === 'order' ? 'orders' : null,
      domain === 'orders' ? 'order' : null,
      // payment vs payments
      domain === 'payment' ? 'payments' : null,
      domain === 'payments' ? 'payment' : null,
      // customer vs customers
      domain === 'customer' ? 'customers' : null,
      domain === 'customers' ? 'customer' : null,
      // supplier vs suppliers
      domain === 'supplier' ? 'suppliers' : null,
      domain === 'suppliers' ? 'supplier' : null,
      // store vs stores
      domain === 'store' ? 'stores' : null,
      domain === 'stores' ? 'store' : null,
      // voucher vs vouchers
      domain === 'voucher' ? 'vouchers' : null,
      domain === 'vouchers' ? 'voucher' : null,
      // promotion vs promotions
      domain === 'promotion' ? 'promotions' : null,
      domain === 'promotions' ? 'promotion' : null,
      // notification vs notifications
      domain === 'notification' ? 'notifications' : null,
      domain === 'notifications' ? 'notification' : null,
      // tag vs tags
      domain === 'tag' ? 'tags' : null,
      domain === 'tags' ? 'tag' : null,
      // unit vs units
      domain === 'unit' ? 'units' : null,
      domain === 'units' ? 'unit' : null,
      // bank vs banks
      domain === 'bank' ? 'banks' : null,
      domain === 'banks' ? 'bank' : null,
      // log vs logs variations
      domain === 'audit_log' ? 'audit_logs' : null,
      domain === 'audit_logs' ? 'audit_log' : null,
      domain === 'webhook_log' ? 'webhook_logs' : null,
      domain === 'webhook_logs' ? 'webhook_log' : null,
      domain === 'user_activity_log' ? 'user_activity_log' : null, // Keep singular
      domain === 'voucher_usage_log' ? 'voucher_usage_log' : null, // Keep singular
      domain === 'external_system_log' ? 'external_system_log' : null, // Keep singular
      domain === 'loyalty_point_log' ? 'loyalty_point_log' : null, // Keep singular
    ].filter(Boolean);

    for (const variation of variations) {
      if (this.domains.has(variation!)) {
        return variation!;
      }
    }

    return null;
  }

  private isChildEntityManagedByParent(domain: string): boolean {
    // List of child entities that are managed through their parent entities
    const childEntities = [
      'dispatch_order_item',
      'dispatch_order_items',
      'inventory_transfer_item',
      'inventory_transfer_items',
    ];

    return childEntities.includes(domain.toLowerCase());
  }

  private normalizeDomainName(domain: string): string {
    // Chuẩn hóa các nhóm domain phổ biến về dạng số nhiều chuẩn
    const lower = domain.toLowerCase();

    // Global entities (plural form)
    if (
      [
        'category',
        'categories',
        'categorys',
        'categorie',
        'categoryes',
        'catagory',
        'catagories',
        'catagorie',
        'catagories',
      ].includes(lower)
    )
      return 'categories';
    if (
      [
        'product',
        'products',
        'productes',
        'productitem',
        'productitems',
      ].includes(lower)
    )
      return 'products';
    if (
      [
        'order',
        'orders',
        'orderitem',
        'orderitems',
        'order_item',
        'order_items',
      ].includes(lower)
    )
      return 'orders';
    if (['customer', 'customers', 'customeres'].includes(lower))
      return 'customers';
    if (['user', 'users', 'useres'].includes(lower)) return 'users';
    if (['store', 'stores', 'storees'].includes(lower)) return 'stores';
    if (['unit', 'units', 'unites'].includes(lower)) return 'units';
    if (['bank', 'banks'].includes(lower)) return 'banks';
    if (['supplier', 'suppliers'].includes(lower)) return 'suppliers';
    if (['voucher', 'vouchers'].includes(lower)) return 'vouchers';
    if (['promotion', 'promotions'].includes(lower)) return 'promotions';
    if (['tag', 'tags'].includes(lower)) return 'tags';
    if (['notification', 'notifications'].includes(lower))
      return 'notifications';
    if (['payment', 'payments'].includes(lower)) return 'payments';

    // Tenant entities with plural form
    if (['return_order', 'return_orders'].includes(lower))
      return 'return_orders';
    if (['stock_transfer', 'stock_transfers'].includes(lower))
      return 'stock_transfers';
    if (['stock_adjustment', 'stock_adjustments'].includes(lower))
      return 'stock_adjustments';
    if (['inventory_transfer', 'inventory_transfers'].includes(lower))
      return 'inventory_transfers';
    if (['inventory_transfer_item', 'inventory_transfer_items'].includes(lower))
      return 'inventory_transfer_items';
    if (['dispatch_order', 'dispatch_orders'].includes(lower))
      return 'dispatch_orders';
    if (['dispatch_order_item', 'dispatch_order_items'].includes(lower))
      return 'dispatch_order_items';
    if (['user_store_mapping', 'user_store_mappings'].includes(lower))
      return 'user_store_mappings';
    if (['payment_method', 'payment_methods'].includes(lower))
      return 'payment_methods';
    if (['price_history', 'price_histories', 'price_historie'].includes(lower))
      return 'price_histories';
    if (['webhook_log', 'webhook_logs'].includes(lower)) return 'webhook_logs';
    if (['audit_log', 'audit_logs'].includes(lower)) return 'audit_logs';

    // Tenant entities with singular form (keep as is)
    if (['installment', 'installments'].includes(lower)) return 'installment';
    if (['debt_transaction', 'debt_transactions'].includes(lower))
      return 'debt_transaction';
    if (['loyalty_point_log', 'loyalty_point_logs'].includes(lower))
      return 'loyalty_point_log';
    if (['job_schedule', 'job_schedules'].includes(lower))
      return 'job_schedule';
    if (['scheduled_task', 'scheduled_tasks'].includes(lower))
      return 'scheduled_task';
    if (['user_activity_log', 'user_activity_logs'].includes(lower))
      return 'user_activity_log';
    if (['voucher_usage_log', 'voucher_usage_logs'].includes(lower))
      return 'voucher_usage_log';
    if (['external_system_log', 'external_system_logs'].includes(lower))
      return 'external_system_log';
    if (['file_attachment', 'file_attachments'].includes(lower))
      return 'file_attachment';
    if (['return_order_item', 'return_order_items'].includes(lower))
      return 'return_order_item';
    if (['stock_transfer_item', 'stock_transfer_items'].includes(lower))
      return 'stock_transfer_item';
    if (['store_setting', 'store_settings'].includes(lower))
      return 'store_setting';
    if (['order_item', 'order_items'].includes(lower)) return 'order_item';

    // Mặc định: normalize snake_case, bỏ s cuối, log/logs
    return domain.replace(/-/g, '_').replace(/s$/, '').replace(/logs$/, 'log');
  }

  private extractDomainFromDtoDir(dtoDir: string): string {
    // Remove 'dto' prefix
    let domain = dtoDir.substring(3);
    // Chuyển từ PascalCase/CamelCase/kebab-case về snake_case
    domain = domain
      .replace(/([A-Z])/g, '_$1')
      .replace(/-/g, '_')
      .toLowerCase();
    if (domain.startsWith('_')) domain = domain.substring(1);

    // Handle special cases for domain normalization
    // These should match the patterns in normalizeDomainName
    if (domain === 'scheduled_task') return 'scheduled_task';
    if (domain === 'stock_transfer_item') return 'stock_transfer_item';
    if (domain === 'user_activity_log') return 'user_activity_log';
    if (domain === 'voucher_usage_log') return 'voucher_usage_log';
    if (domain === 'external_system_log') return 'external_system_log';
    if (domain === 'loyalty_point_log') return 'loyalty_point_log';
    if (domain === 'webhook_log') return 'webhook_log';
    if (domain === 'audit_log') return 'audit_log';

    return domain;
  }

  private extractDomain(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    // If in a dtoX directory, return X as the domain
    const parts = filePath.split(path.sep);
    const dtoDir = parts.find((p) => p.startsWith('dto') && p.length > 3);
    if (dtoDir) {
      return this.extractDomainFromDtoDir(dtoDir);
    }

    // Handle special cases for response DTOs - extract the base domain
    if (fileName.includes('ResponseDto')) {
      const baseDomain = fileName.replace('ResponseDto', '').toLowerCase();
      return baseDomain;
    }

    // Handle create/update DTOs - extract the base domain
    if (fileName.startsWith('create-') || fileName.startsWith('update-')) {
      const baseDomain = fileName
        .replace(/^(create|update)-/, '')
        .toLowerCase();
      return baseDomain;
    }

    // Handle kebab-case to snake_case conversion
    let domain = fileName.replace(/\.(entity|dto|controller|service)$/, '');

    // Convert kebab-case to snake_case for consistency
    domain = domain.replace(/-/g, '_');

    return domain;
  }

  private isSnakeCase(str: string): boolean {
    // Snake case: lowercase letters, numbers, and underscores only
    // Should not start or end with underscore, no consecutive underscores
    return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    // Camel case: starts with lowercase, then can have uppercase letters
    // No underscores, no spaces, no special characters except letters and numbers
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  private analyzeDtoFiles(dtoFiles: string[]): {
    types: Set<string>;
    namingIssues: string[];
  } {
    const types = new Set<string>();
    const namingIssues: string[] = [];

    for (const dtoFile of dtoFiles) {
      const fileName = path.basename(dtoFile);

      // Detect DTO types
      if (fileName.includes('create-') || fileName.includes('create.')) {
        types.add('create');
      }
      if (fileName.includes('update-') || fileName.includes('update.')) {
        types.add('update');
      }
      if (fileName.includes('response') || fileName.includes('ResponseDto')) {
        types.add('response');
      }
      if (fileName.includes('auth.') || fileName.includes('auth-')) {
        types.add('auth');
      }

      // Check naming consistency
      // Check for naming consistency - both patterns are acceptable
      // Don't flag naming issues as both kebab-case and PascalCase are valid
      // if (fileName.includes('ResponseDto') && !fileName.includes('-response')) {
      //   namingIssues.push('Consider using kebab-case for response DTOs (e.g., user-response.dto.ts)');
      // }

      // if (fileName.includes('-response') && !fileName.includes('ResponseDto')) {
      //   namingIssues.push('Consider using PascalCase for response DTOs (e.g., UserResponseDto.ts)');
      // }
    }

    return { types, namingIssues };
  }

  private getRequiredDtoTypes(domain: string): string[] {
    // Define which DTO types are required for each domain
    // Use normalized domain names (plural form) to match normalizeDomainName
    const domainRequirements: Record<string, string[]> = {
      auth: ['auth'], // Auth only needs auth DTO
      // Global entities (plural)
      users: ['create', 'update', 'response'],
      banks: ['create', 'update', 'response'],
      payment_methods: ['create', 'update', 'response'],
      stores: ['create', 'update', 'response'],
      units: ['create', 'update', 'response'],
      user_store_mappings: ['create', 'update', 'response'],
      // Tenant entities (plural)
      categories: ['create', 'update', 'response'],
      products: ['create', 'update', 'response'],
      orders: ['create', 'update', 'response'],
      payments: ['create', 'update', 'response'],
      customers: ['create', 'update', 'response'],
      suppliers: ['create', 'update', 'response'],
      vouchers: ['create', 'update', 'response'],
      promotions: ['create', 'update', 'response'],
      notifications: ['create', 'update', 'response'],
      tags: ['create', 'update', 'response'],
      audit_logs: ['create', 'update', 'response'],
      // Tenant entities (singular form for consistency)
      installment: ['create', 'update', 'response'],
      debt_transaction: ['create', 'update', 'response'],
      loyalty_point_log: ['create', 'update', 'response'],
      job_schedule: ['create', 'update', 'response'],
      scheduled_task: ['create', 'update', 'response'],
      user_activity_log: ['create', 'update', 'response'],
      voucher_usage_log: ['create', 'update', 'response'],
      external_system_log: ['create', 'update', 'response'],
      file_attachment: ['create', 'update', 'response'],
      inventory_transfers: ['create', 'update', 'response'],
      inventory_transfer_items: ['create', 'update', 'response'],
      dispatch_orders: ['create', 'update', 'response'],
      dispatch_order_items: ['create', 'update', 'response'],
      return_orders: ['create', 'update', 'response'],
      return_order_item: ['create', 'update', 'response'],
      stock_adjustments: ['create', 'update', 'response'],
      stock_transfers: ['create', 'update', 'response'],
      stock_transfer_item: ['create', 'update', 'response'],
      store_setting: ['create', 'update', 'response'],
      order_item: ['create', 'update', 'response'],
      price_histories: ['create', 'update', 'response'],
      webhook_logs: ['create', 'update', 'response'],
    };

    return domainRequirements[domain] || ['create', 'update', 'response'];
  }

  private isSpecialDomain(domain: string): boolean {
    // List of domains that have special requirements and shouldn't follow standard CRUD patterns
    const specialDomains = [
      'auth', // Authentication domain - no entity, special endpoints
    ];

    return specialDomains.includes(domain.toLowerCase());
  }

  private isAuthDomain(domain: string): boolean {
    return domain.toLowerCase() === 'auth';
  }

  private async checkEntities(): Promise<void> {
    Logger.log('📝 Checking Entities...');

    for (const [domain, check] of this.domains) {
      // Skip entity check for special domains that don't need entities
      if (this.isSpecialDomain(domain)) {
        continue;
      }

      if (!check.entityFile) {
        check.issues.push({
          type: 'warning',
          message: 'No entity file found',
        });
        continue;
      }

      const content = fs.readFileSync(check.entityFile, 'utf-8');

      // Check @Entity decorator
      if (!content.includes('@Entity(')) {
        check.issues.push({
          type: 'error',
          message: 'Missing @Entity() decorator',
          file: check.entityFile,
        });
      }

      // Check primary key
      if (
        !content.includes('@PrimaryGeneratedColumn') &&
        !content.includes('@PrimaryColumn')
      ) {
        check.issues.push({
          type: 'error',
          message: 'Missing primary key decorator',
          file: check.entityFile,
        });
      }

      // Check timestamps
      if (
        !content.includes('@CreateDateColumn') ||
        !content.includes('@UpdateDateColumn')
      ) {
        check.issues.push({
          type: 'warning',
          message: 'Missing timestamp columns',
          file: check.entityFile,
        });
      }

      // Check soft delete
      if (!content.includes('is_deleted')) {
        check.issues.push({
          type: 'warning',
          message: 'Missing soft delete field (is_deleted)',
          file: check.entityFile,
        });
      }

      // Check audit fields for tenant entities
      if (check.entityFile.includes('/tenant/')) {
        if (
          !content.includes('created_by_user_id') ||
          !content.includes('updated_by_user_id')
        ) {
          check.issues.push({
            type: 'warning',
            message:
              'Missing audit fields (created_by_user_id, updated_by_user_id)',
            file: check.entityFile,
          });
        }
      }

      // Check proper column naming (snake_case)
      const columnDecorators = content.match(
        /@(Column|PrimaryColumn|CreateDateColumn|UpdateDateColumn|DeleteDateColumn)[^)]*\)/g,
      );
      if (columnDecorators) {
        const nonSnakeCaseColumns: string[] = [];

        for (const decorator of columnDecorators) {
          // Extract name from decorator if present
          const nameMatch = decorator.match(/name:\s*['"`]([^'"`]+)['"`]/);
          if (nameMatch) {
            const columnName = nameMatch[1];
            // Allow both snake_case and camelCase for column names
            if (
              !this.isSnakeCase(columnName) &&
              !this.isCamelCase(columnName)
            ) {
              nonSnakeCaseColumns.push(columnName);
            }
          } else {
            // If no explicit name, check the property name that follows
            const propertyMatch = content.match(
              new RegExp(
                `${decorator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*([a-zA-Z_]+)\\s*[!:?]`,
              ),
            );
            if (propertyMatch) {
              const propertyName = propertyMatch[1];
              // Allow both snake_case and camelCase for property names
              if (
                !this.isSnakeCase(propertyName) &&
                !this.isCamelCase(propertyName)
              ) {
                nonSnakeCaseColumns.push(propertyName);
              }
            }
          }
        }

        if (nonSnakeCaseColumns.length > 0) {
          check.issues.push({
            type: 'info',
            message: `Consider using snake_case or camelCase for column names: ${nonSnakeCaseColumns.join(', ')}`,
            file: check.entityFile,
          });
        }
      }
    }
  }

  private async checkDTOs(): Promise<void> {
    Logger.log('🎯 Checking DTOs...');

    for (const [domain, check] of this.domains) {
      if (check.dtoFiles.length === 0) {
        // Log debug: in ra danh sách file thực tế trong thư mục dto
        const dtoDir = `src/dto/dto${domain.charAt(0).toUpperCase() + domain.slice(1)}`;
        if (fs.existsSync(dtoDir)) {
          const files = fs.readdirSync(dtoDir);
          Logger.log(
            `🔍 [DEBUG] No DTO files found for domain '${domain}'. Files in ${dtoDir}: ${files.join(', ')}`,
          );
        } else {
          Logger.log(
            `🔍 [DEBUG] No DTO files found for domain '${domain}'. Directory ${dtoDir} does not exist.`,
          );
        }
        check.issues.push({
          type: 'error',
          message: 'No DTO files found',
        });
        continue;
      }

      // Analyze DTO files and categorize them
      const dtoAnalysis = this.analyzeDtoFiles(check.dtoFiles);

      // Check for required DTO types based on domain
      const requiredTypes = this.getRequiredDtoTypes(domain);
      const missingTypes = requiredTypes.filter(
        (type) => !dtoAnalysis.types.has(type),
      );

      for (const missingType of missingTypes) {
        check.issues.push({
          type: 'warning',
          message: `Missing ${missingType} DTO`,
          file: check.dtoFiles[0],
        });
      }

      // Check for naming consistency
      if (dtoAnalysis.namingIssues.length > 0) {
        for (const issue of dtoAnalysis.namingIssues) {
          check.issues.push({
            type: 'info',
            message: issue,
            file: check.dtoFiles[0],
          });
        }
      }

      // Check DTO validation and structure
      for (const dtoFile of check.dtoFiles) {
        const content = fs.readFileSync(dtoFile, 'utf-8');
        const fileName = path.basename(dtoFile);

        // Skip validation checks for response DTOs (they might not need validation)
        const isResponseDto =
          fileName.includes('response') || fileName.includes('ResponseDto');
        const isAuthDto = fileName.includes('auth');
        const isUpdateDto =
          fileName.includes('update') || fileName.includes('Update');

        if (!isResponseDto && !isAuthDto) {
          // Check for validation decorators in create/update DTOs
          const hasValidation =
            content.includes('@IsString') ||
            content.includes('@IsNumber') ||
            content.includes('@IsBoolean') ||
            content.includes('@IsOptional') ||
            content.includes('@IsEmail') ||
            content.includes('@IsDateString') ||
            content.includes('@IsArray') ||
            content.includes('@ValidateNested') ||
            content.includes('@IsUUID') ||
            content.includes('PartialType'); // Update DTOs often use PartialType

          if (!hasValidation) {
            check.issues.push({
              type: 'warning',
              message: 'Missing validation decorators',
              file: dtoFile,
            });
          }
        }

        // Check for ApiProperty decorators
        const hasApiProperty =
          content.includes('@ApiProperty') || content.includes('PartialType'); // PartialType inherits ApiProperty from base DTO

        if (!hasApiProperty) {
          check.issues.push({
            type: 'warning',
            message: 'Missing @ApiProperty decorators for Swagger',
            file: dtoFile,
          });
        }

        // Check for proper field naming (camelCase)
        const fieldMatches = content.match(
          /@ApiProperty[^)]*\)\s*([a-zA-Z_]+)/g,
        );
        if (fieldMatches) {
          const hasSnakeCase = fieldMatches.some(
            (match) => match.includes('_') && !match.includes('@ApiProperty'),
          );
          if (hasSnakeCase) {
            check.issues.push({
              type: 'info',
              message: 'Consider using camelCase for DTO field names',
              file: dtoFile,
            });
          }
        }

        // Check for @Exclude decorator in response DTOs
        if (isResponseDto) {
          // Danh sách trường nhạy cảm phổ biến
          const sensitiveFields = [
            'createdByUserId',
            'updatedByUserId',
            'created_by_user_id',
            'updated_by_user_id',
            'isDeleted',
            'is_deleted',
            'password',
            'token',
            'schemaName',
            'managerUserId',
            'bankId',
            'accountNo',
            'accountName',
            'passwordHash',
            'passwordResetToken',
            'tokenExpiryAt',
            'diff',
            'ipAddress',
          ];
          // Có trường nhạy cảm nào không?
          const hasSensitiveFields = sensitiveFields.some((f) =>
            content.includes(f),
          );

          // Nếu là audit_logs, không cảnh báo về @Exclude
          if (domain === 'audit_logs') {
            // Do not warn for audit_logs, as all fields are intentionally exposed for global admin
            continue;
          }

          // Nếu đã có @Exclude cho các trường nhạy cảm thì không cảnh báo
          const hasExcludeForSensitive = sensitiveFields.some(
            (f) => content.includes(f) && content.includes('@Exclude'),
          );
          if (hasSensitiveFields && !hasExcludeForSensitive) {
            check.issues.push({
              type: 'info',
              message:
                'Consider using @Exclude for sensitive fields in response DTOs',
              file: dtoFile,
            });
          }
        }

        // Check for proper imports
        if (!content.includes('import {') || !content.includes('from')) {
          check.issues.push({
            type: 'info',
            message: 'Consider adding proper imports for decorators',
            file: dtoFile,
          });
        }
      }
    }
  }

  private async checkControllers(): Promise<void> {
    Logger.log('🎮 Checking Controllers...');

    for (const [domain, check] of this.domains) {
      // Skip controller check for child entities that are managed through parent entities
      if (this.isChildEntityManagedByParent(domain)) {
        continue;
      }

      if (!check.controllerFile) {
        check.issues.push({
          type: 'warning',
          message: 'No controller file found',
        });
        continue;
      }

      const content = fs.readFileSync(check.controllerFile, 'utf-8');

      // Check @Controller decorator
      if (!content.includes('@Controller(')) {
        check.issues.push({
          type: 'error',
          message: 'Missing @Controller() decorator',
          file: check.controllerFile,
        });
      }

      // Check endpoints - different logic for special domains
      if (this.isAuthDomain(domain)) {
        // For auth domain, check for authentication-specific endpoints
        const authEndpoints = ['@Post()', '@Get()'];
        const foundAuthEndpoints = authEndpoints.filter((endpoint) =>
          content.includes(endpoint),
        );

        // Count actual endpoints by looking for method decorators
        const endpointMatches = content.match(
          /@(Post|Get|Put|Patch|Delete)\(/g,
        );
        const actualEndpointCount = endpointMatches
          ? endpointMatches.length
          : 0;

        // Auth domain should have multiple authentication endpoints (at least 5 for a complete auth system)
        if (actualEndpointCount < 5) {
          check.issues.push({
            type: 'warning',
            message: `Limited authentication endpoints: found ${actualEndpointCount} endpoints (${foundAuthEndpoints.join(', ')})`,
            file: check.controllerFile,
          });
        }

        // Check for specific auth endpoints
        const specificAuthEndpoints = [
          'login',
          'logout',
          'register',
          'refresh-token',
          'forgot-password',
          'reset-password',
          'me',
        ];
        const foundSpecificEndpoints = specificAuthEndpoints.filter(
          (endpoint) => content.includes(endpoint),
        );

        if (foundSpecificEndpoints.length < 4) {
          check.issues.push({
            type: 'info',
            message: `Consider adding more authentication endpoints: ${specificAuthEndpoints.join(', ')}`,
            file: check.controllerFile,
          });
        }
      } else if (this.isSpecialDomain(domain)) {
        // Check CRUD endpoints for regular domains
        const endpoints = ['@Get()', '@Post()', '@Patch()', '@Delete()'];
        const foundEndpoints = endpoints.filter((endpoint) =>
          content.includes(endpoint),
        );

        if (foundEndpoints.length < 2) {
          check.issues.push({
            type: 'warning',
            message: `Limited CRUD endpoints: ${foundEndpoints.join(', ')}`,
            file: check.controllerFile,
          });
        }
      }

      // Check for DTO usage
      if (!content.includes('@Body()') && content.includes('@Post()')) {
        check.issues.push({
          type: 'warning',
          message: 'POST endpoint without @Body() DTO',
          file: check.controllerFile,
        });
      }

      // Check for Swagger decorators
      if (!content.includes('@ApiTags') && !content.includes('@ApiOperation')) {
        check.issues.push({
          type: 'warning',
          message: 'Missing Swagger documentation decorators',
          file: check.controllerFile,
        });
      }

      // Check for authentication guards - skip for auth domain
      if (!this.isAuthDomain(domain)) {
        if (
          !content.includes('@UseGuards') &&
          !content.includes('EnhancedAuthGuard')
        ) {
          check.issues.push({
            type: 'warning',
            message: 'Missing authentication guards',
            file: check.controllerFile,
          });
        }
      }

      // Check for permission decorators - skip for auth domain
      if (!this.isAuthDomain(domain)) {
        const hasPermissionDecorators =
          content.includes('@RequireUserPermission') ||
          content.includes('@Roles') ||
          content.includes('@UseGuards') ||
          content.includes('EnhancedAuthGuard') ||
          content.includes('@ApiBearerAuth');

        if (!hasPermissionDecorators) {
          check.issues.push({
            type: 'info',
            message: 'Consider adding permission decorators for security',
            file: check.controllerFile,
          });
        }
      }

      // Check for rate limiting - optional enhancement
      if (
        !content.includes('@RateLimitAPI') &&
        !content.includes('@RateLimitAuth') &&
        !content.includes('@RateLimitModerate')
      ) {
        check.issues.push({
          type: 'info',
          message: 'Consider adding rate limiting decorators',
          file: check.controllerFile,
        });
      }

      // Check for audit interceptor - optional enhancement (skip for auth domain as it has its own audit logic)
      if (!this.isAuthDomain(domain)) {
        if (
          !content.includes('@UseInterceptors') &&
          !content.includes('AuditInterceptor')
        ) {
          check.issues.push({
            type: 'info',
            message: 'Consider adding audit interceptor for logging',
            file: check.controllerFile,
          });
        }
      }
    }
  }

  private async checkServices(): Promise<void> {
    Logger.log('🧪 Checking Services...');

    for (const [domain, check] of this.domains) {
      // Skip service check for child entities that are managed through parent entities
      if (this.isChildEntityManagedByParent(domain)) {
        continue;
      }

      if (!check.serviceFile) {
        check.issues.push({
          type: 'warning',
          message: 'No service file found',
        });
        continue;
      }

      const content = fs.readFileSync(check.serviceFile, 'utf-8');

      // Check @Injectable decorator
      if (!content.includes('@Injectable()')) {
        check.issues.push({
          type: 'error',
          message: 'Missing @Injectable() decorator',
          file: check.serviceFile,
        });
      }

      // Different checks for special domains vs regular domains
      if (this.isAuthDomain(domain)) {
        // For auth domain, check for authentication-specific patterns
        const hasAuthPatterns =
          content.includes('JwtService') ||
          content.includes('bcrypt') ||
          content.includes('validateUser') ||
          content.includes('login') ||
          content.includes('logout') ||
          content.includes('SecurityService') ||
          content.includes('UsersService');

        if (!hasAuthPatterns) {
          check.issues.push({
            type: 'warning',
            message: 'No authentication-specific patterns found',
            file: check.serviceFile,
          });
        }

        // Check for proper service dependencies for auth
        const hasAuthDependencies =
          content.includes('UsersService') ||
          content.includes('JwtService') ||
          content.includes('SecurityService');

        if (!hasAuthDependencies) {
          check.issues.push({
            type: 'warning',
            message: 'No authentication service dependencies found',
            file: check.serviceFile,
          });
        }
      } else if (this.isSpecialDomain(domain)) {
        // Check for mapper usage - recognize multiple valid patterns
        const hasMapperFunctions =
          content.includes('mapToResponseDto') ||
          content.includes('mapToEntity') ||
          content.includes('DtoMapper') ||
          content.includes('class-transformer') ||
          content.includes('plainToClass') ||
          content.includes('instanceToPlain') ||
          content.includes('Repository<') ||
          content.includes('getRepository') ||
          content.includes('repo.create') ||
          content.includes('repo.merge') ||
          content.includes('repo.save');

        if (!hasMapperFunctions) {
          check.issues.push({
            type: 'warning',
            message: 'No mapper functions or repository patterns found',
            file: check.serviceFile,
          });
        }

        // Check for proper database service usage
        const hasDatabaseService =
          content.includes('GlobalDataSourceService') ||
          content.includes('TenantBaseService') ||
          content.includes('TenantDataSourceService') ||
          content.includes('DataSource') ||
          content.includes('getDataSource') ||
          content.includes('Repository<') ||
          content.includes('getRepository');

        if (!hasDatabaseService) {
          check.issues.push({
            type: 'warning',
            message: 'No database service injection found',
            file: check.serviceFile,
          });
        }
      }

      // Check for proper error handling - auth domain has its own error handling
      if (!this.isAuthDomain(domain)) {
        if (
          !content.includes('NotFoundException') &&
          !content.includes('ConflictException') &&
          !content.includes('UnauthorizedException')
        ) {
          check.issues.push({
            type: 'info',
            message:
              'Consider adding proper error handling with custom exceptions',
            file: check.serviceFile,
          });
        }
      }

      // Check for soft delete implementation - skip for special domains
      if (!this.isSpecialDomain(domain)) {
        const hasSoftDelete =
          content.includes('is_deleted: false') ||
          content.includes('is_deleted: true') ||
          content.includes('isDeleted: false') ||
          content.includes('isDeleted: true') ||
          (content.includes('is_deleted') && content.includes('where')) ||
          (content.includes('isDeleted') && content.includes('where'));

        // Skip soft delete warning for audit_logs domain
        if (domain === 'audit_logs') {
          // Skip for audit_logs as it's intentionally exposed for global admin
          continue;
        }

        if (content.includes('is_deleted') && !hasSoftDelete) {
          check.issues.push({
            type: 'info',
            message: 'Consider implementing soft delete queries',
            file: check.serviceFile,
          });
        }
      }

      // Check for audit logging - skip for special domains
      if (!this.isSpecialDomain(domain)) {
        const hasAuditLogging =
          content.includes('created_by_user_id') ||
          content.includes('updated_by_user_id') ||
          content.includes('createdByUserId') ||
          content.includes('updatedByUserId') ||
          content.includes('userId') ||
          content.includes('user_id') ||
          content.includes('AuditLogsModule') ||
          content.includes('audit');

        // --- BỔ SUNG: Nếu service không có audit logging, kiểm tra controller có interceptor không ---
        if (!hasAuditLogging) {
          let controllerHasAuditInterceptor = false;
          if (check.controllerFile && fs.existsSync(check.controllerFile)) {
            const controllerContent = fs.readFileSync(
              check.controllerFile,
              'utf-8',
            );
            if (
              controllerContent.includes(
                '@UseInterceptors(AuditInterceptor)',
              ) ||
              controllerContent.includes('import { AuditInterceptor')
            ) {
              controllerHasAuditInterceptor = true;
            }
          }
          if (!controllerHasAuditInterceptor) {
            check.issues.push({
              type: 'info',
              message: 'Consider implementing audit logging',
              file: check.serviceFile,
            });
          }
        }
      }
    }
  }

  private async checkModules(): Promise<void> {
    Logger.log('📦 Checking Modules...');

    for (const [domain, check] of this.domains) {
      // Skip module check for child entities that are managed through parent entities
      if (this.isChildEntityManagedByParent(domain)) {
        continue;
      }

      if (!check.moduleFile) {
        check.issues.push({
          type: 'warning',
          message: 'No module file found',
        });
        continue;
      }

      const content = fs.readFileSync(check.moduleFile, 'utf-8');

      // Check @Module decorator
      if (!content.includes('@Module(')) {
        check.issues.push({
          type: 'error',
          message: 'Missing @Module() decorator',
          file: check.moduleFile,
        });
      }

      // Check for proper imports
      if (
        !content.includes('imports:') &&
        !content.includes('providers:') &&
        !content.includes('controllers:')
      ) {
        check.issues.push({
          type: 'warning',
          message:
            'Module missing required properties (imports, providers, controllers)',
          file: check.moduleFile,
        });
      }

      // Check for database service imports
      if (check.entityFile?.includes('/global/')) {
        if (!content.includes('GlobalDataSourceService')) {
          check.issues.push({
            type: 'warning',
            message: 'Global entity should import GlobalDataSourceService',
            file: check.moduleFile,
          });
        }
      }

      if (check.entityFile?.includes('/tenant/')) {
        if (
          !content.includes('TenantBaseService') &&
          !content.includes('TenantDataSourceService')
        ) {
          check.issues.push({
            type: 'info',
            message: 'Tenant entity should consider using TenantBaseService',
            file: check.moduleFile,
          });
        }
      }

      // Check for audit logs module import - optional enhancement
      if (!content.includes('AuditLogsModule')) {
        check.issues.push({
          type: 'info',
          message: 'Consider importing AuditLogsModule for audit logging',
          file: check.moduleFile,
        });
      }

      // Check for security module import - auth domain has its own security services
      if (!this.isAuthDomain(domain)) {
        if (!content.includes('SecurityModule')) {
          check.issues.push({
            type: 'info',
            message: 'Consider importing SecurityModule for authentication',
            file: check.moduleFile,
          });
        }
      }
    }
  }

  private async checkSwagger(): Promise<void> {
    Logger.log('📚 Checking Swagger Configuration...');

    // Check if openapi.json exists
    if (!fs.existsSync('openapi.json')) {
      this.issues.push({
        type: 'warning',
        message:
          'openapi.json not found. Run the app in development mode to generate it.',
      });
    } else {
      try {
        const openapiContent = JSON.parse(
          fs.readFileSync('openapi.json', 'utf-8'),
        );

        // Check if paths exist
        if (
          !openapiContent.paths ||
          Object.keys(openapiContent.paths).length === 0
        ) {
          this.issues.push({
            type: 'warning',
            message: 'No API paths found in openapi.json',
          });
        }

        // Check if schemas exist
        if (
          !openapiContent.components?.schemas ||
          Object.keys(openapiContent.components.schemas).length === 0
        ) {
          this.issues.push({
            type: 'warning',
            message: 'No schemas found in openapi.json',
          });
        }
      } catch (error) {
        this.issues.push({
          type: 'error',
          message: 'Invalid openapi.json format',
        });
      }
    }
  }

  private generateReport(): void {
    Logger.log('📊 SYNC CHECK REPORT');
    Logger.log('='.repeat(50));

    let totalIssues = 0;
    let criticalIssues = 0;
    let warnings = 0;

    for (const [domain, check] of this.domains) {
      Logger.log(`🏷️  Domain: ${domain}`);

      // Special handling for auth domain - no entity needed
      if (this.isAuthDomain(domain)) {
        Logger.log(`   Entity: 🔐 Authentication Domain (No Entity Required)`);
      } else {
        Logger.log(`   Entity: ${check.entityFile || '❌ Missing'}`);
      }

      Logger.log(`   DTOs: ${check.dtoFiles.length} files`);
      Logger.log(`   Controller: ${check.controllerFile || '❌ Missing'}`);
      Logger.log(`   Service: ${check.serviceFile || '❌ Missing'}`);
      Logger.log(`   Module: ${check.moduleFile || '❌ Missing'}`);

      if (check.issues.length > 0) {
        Logger.log('   Issues:');
        for (const issue of check.issues) {
          const icon =
            issue.type === 'error'
              ? '❌'
              : issue.type === 'warning'
                ? '⚠️'
                : 'ℹ️';
          Logger.log(`     ${icon} ${issue.message}`);
          if (issue.file) {
            Logger.log(`        File: ${issue.file}`);
          }

          if (issue.type === 'error') criticalIssues++;
          else if (issue.type === 'warning') warnings++;
          totalIssues++;
        }
      } else {
        Logger.log('   ✅ No issues found');
      }
    }

    // Global issues
    if (this.issues.length > 0) {
      Logger.log('🌐 Global Issues:');
      for (const issue of this.issues) {
        const icon =
          issue.type === 'error'
            ? '❌'
            : issue.type === 'warning'
              ? '⚠️'
              : 'ℹ️';
        Logger.log(`   ${icon} ${issue.message}`);

        if (issue.type === 'error') criticalIssues++;
        else if (issue.type === 'warning') warnings++;
        totalIssues++;
      }
    }

    // Summary
    Logger.log('📈 SUMMARY');
    Logger.log('='.repeat(50));
    Logger.log(`Total Domains: ${this.domains.size}`);
    Logger.log(`Total Issues: ${totalIssues}`);
    Logger.log(`Critical Issues: ${criticalIssues}`);
    Logger.log(`Warnings: ${warnings}`);

    if (criticalIssues === 0 && warnings === 0) {
      Logger.log('🎉 All checks passed! Your code is well-synchronized.');
    } else if (criticalIssues === 0) {
      Logger.log(
        '⚠️  Some warnings found. Consider addressing them for better code quality.',
      );
    } else {
      Logger.log(
        '❌ Critical issues found. Please fix them before proceeding.',
      );
    }

    // Recommendations
    if (totalIssues > 0) {
      Logger.log('💡 RECOMMENDATIONS:');
      Logger.log('1. Fix all critical issues first');
      Logger.log('2. Address warnings for better code quality');
      Logger.log('3. Ensure all DTOs have proper validation');
      Logger.log('4. Add Swagger documentation for all endpoints');
      Logger.log('5. Implement proper mapper functions');
      Logger.log('6. Use appropriate database services (Global vs Tenant)');
      Logger.log('7. Add authentication guards and permission decorators');
      Logger.log('8. Implement audit logging and rate limiting');
      Logger.log('9. Use proper module imports and dependencies');
      Logger.log(
        '10. Follow naming conventions (snake_case for DB, camelCase for API)',
      );
    }
  }
}

// Run the checker
if (require.main === module) {
  const checker = new SyncChecker();
  checker.run().catch(Logger.error);
}

export default SyncChecker;
