// src/tenant/tenant-datasource.service.ts
import {
  Injectable,
  OnModuleDestroy,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getTenantDbConfig } from './getTenantDbConfig';
import { InjectDataSource } from '@nestjs/typeorm';
import { Store } from '../entities/global/store.entity';

interface CachedDataSource {
  dataSource: DataSource;
  lastAccessed: Date;
  accessCount: number;
}

@Injectable()
export class TenantDataSourceService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantDataSourceService.name);
  private tenantDataSources = new Map<string, CachedDataSource>();
  private initializingDataSources = new Map<string, Promise<DataSource>>();
  private cleanupInterval!: NodeJS.Timeout;

  // Configuration
  private readonly MAX_CACHED_CONNECTIONS = 50;
  private readonly CONNECTION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectDataSource('globalConnection')
    private globalDataSource: DataSource,
  ) {
    // Khởi tạo cleanup job để đóng các connection không sử dụng
    this.startCleanupJob();
  }

  /**
   * Lấy hoặc tạo DataSource cho một cửa hàng cụ thể với caching và validation
   */
  async getTenantDataSource(storeId: string): Promise<DataSource> {
    if (!storeId.trim()) {
      throw new Error('Store ID cannot be empty');
    }

    try {
      // 1. Validate và lấy thông tin store từ Global Database
      const store = await this.getValidatedStore(storeId);

      const dbName = store.databaseName;

      // 2. Kiểm tra cache
      if (this.hasCachedDataSource(dbName)) {
        this.updateAccessInfo(dbName);
        this.logger.debug(
          `Returning cached DataSource for store: ${storeId} (db: ${dbName})`,
        );
        return this.tenantDataSources.get(dbName)!.dataSource;
      }

      // 3. Kiểm tra DataSource đang được khởi tạo
      if (this.initializingDataSources.has(dbName)) {
        this.logger.debug(
          `Waiting for DataSource initialization: ${storeId} (db: ${dbName})`,
        );
        return await this.initializingDataSources.get(dbName)!;
      }

      // 4. Khởi tạo DataSource mới
      return await this.initializeNewDataSource(storeId, dbName);
    } catch (error) {
      this.logger.error(
        `Failed to get tenant DataSource for store: ${storeId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Validate store và kiểm tra các điều kiện business
   */
  private async getValidatedStore(storeId: string): Promise<Store> {
    const storeRepo = this.globalDataSource.getRepository(Store);
    const store = await storeRepo.findOne({
      where: {
        id: storeId,
        isActive: true, // Chỉ lấy store đang active
        isDelete: false, // Không bị soft delete
      },
    });
    if (!store) {
      this.logger.warn(
        `Attempted to access non-existent or inactive store: ${storeId}`,
      );
      throw new NotFoundException(
        `Store with ID ${storeId} not found or inactive`,
      );
    }

    if (!store.databaseName.trim()) {
      this.logger.error(`Store ${storeId} has no database name configured`);
      throw new Error(`Store ${storeId} has invalid database configuration`);
    }

    return store;
  }

  /**
   * Kiểm tra xem có cached DataSource hợp lệ không
   */
  private hasCachedDataSource(dbName: string): boolean {
    const cached = this.tenantDataSources.get(dbName);
    return cached?.dataSource.isInitialized === true;
  }

  /**
   * Cập nhật thông tin truy cập cho cached DataSource
   */
  private updateAccessInfo(dbName: string): void {
    const cached = this.tenantDataSources.get(dbName);
    if (cached) {
      cached.lastAccessed = new Date();
      cached.accessCount++;
    }
  }

  /**
   * Khởi tạo DataSource mới với proper error handling
   */
  private async initializeNewDataSource(
    storeId: string,
    dbName: string,
  ): Promise<DataSource> {
    // Kiểm tra giới hạn số lượng connection
    if (this.tenantDataSources.size >= this.MAX_CACHED_CONNECTIONS) {
      await this.cleanupOldestConnections();
    }

    const initPromise = this.createDataSourceInitPromise(storeId, dbName);
    this.initializingDataSources.set(dbName, initPromise);

    try {
      const dataSource = await initPromise;

      // Cache DataSource với metadata
      this.tenantDataSources.set(dbName, {
        dataSource,
        lastAccessed: new Date(),
        accessCount: 1,
      });

      this.logger.log(
        `Tenant DataSource initialized successfully for store: ${storeId} (db: ${dbName})`,
      );
      return dataSource;
    } finally {
      this.initializingDataSources.delete(dbName);
    }
  }

  /**
   * Tạo Promise để khởi tạo DataSource
   */
  private async createDataSourceInitPromise(
    storeId: string,
    dbName: string,
  ): Promise<DataSource> {
    this.logger.log(
      `Initializing new DataSource for store: ${storeId} (db: ${dbName})`,
    );

    const tenantConfig = getTenantDbConfig(dbName);
    const newDataSource = new DataSource(tenantConfig);

    try {
      await newDataSource.initialize();

      // Test connection
      const shouldSync = await this.shouldSynchronize(newDataSource);
      if (shouldSync) {
        this.logger.warn(`Synchronizing schema for db: ${dbName}`);
        await newDataSource.synchronize();
      }

      return newDataSource;
    } catch (error) {
      this.logger.error(
        `Failed to initialize DataSource for store: ${storeId} (db: ${dbName})`,
        error instanceof Error ? error.message : String(error),
      );

      // Cleanup nếu initialization thất bại
      if (newDataSource.isInitialized) {
        try {
          await newDataSource.destroy();
        } catch (destroyError) {
          this.logger.error(
            'Failed to cleanup failed DataSource',
            destroyError,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Kiểm tra xem có cần đồng bộ hóa schema không
   * Nếu bảng 'products' không tồn tại, sẽ đồng bộ hóa schema
   */
  /**
   * Kiểm tra xem có cần đồng bộ hóa schema không
   * Nếu bảng 'products' không tồn tại, sẽ đồng bộ hóa schema
   */
  private async shouldSynchronize(dataSource: DataSource): Promise<boolean> {
    try {
      // Check TypeORM migrations table
      const result: unknown = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      ) as "exists"
    `);

      // Type guard for result validation
      const isValidExistsResult = (
        data: unknown,
      ): data is Array<{ exists: boolean }> => {
        return (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === 'object' &&
          data[0] !== null &&
          'exists' in data[0] &&
          typeof (data[0] as Record<string, unknown>).exists === 'boolean'
        );
      };

      if (!isValidExistsResult(result) || !result[0].exists) {
        return true; // Chưa có migration table → DB mới
      }

      // Optional: Check migration status
      const migrationCountResult: unknown = await dataSource.query(`
      SELECT COUNT(*) as count FROM migrations
    `);

      // Type guard for count result validation
      const isValidCountResult = (
        data: unknown,
      ): data is Array<{ count: string }> => {
        return (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === 'object' &&
          data[0] !== null &&
          'count' in data[0] &&
          typeof (data[0] as Record<string, unknown>).count === 'string'
        );
      };

      if (!isValidCountResult(migrationCountResult)) {
        return true; // Default to sync if can't determine migration count
      }

      return parseInt(migrationCountResult[0].count, 10) === 0; // Chưa có migration nào
    } catch (err) {
      this.logger.warn('Migration check failed. Defaulting to sync.', err);
      return true;
    }
  }

  /**
   * Dọn dẹp các connection cũ nhất khi đạt giới hạn
   */
  private async cleanupOldestConnections(): Promise<void> {
    const sortedEntries = Array.from(this.tenantDataSources.entries()).sort(
      ([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime(),
    );

    const toRemove = sortedEntries.slice(
      0,
      Math.floor(this.MAX_CACHED_CONNECTIONS * 0.2),
    );

    for (const [dbName] of toRemove) {
      await this.closeTenantDataSource(dbName);
    }
  }

  /**
   * Đóng DataSource cụ thể
   */
  async closeTenantDataSource(dbName: string): Promise<void> {
    const cached = this.tenantDataSources.get(dbName);
    if (!cached) return;

    try {
      if (cached.dataSource.isInitialized) {
        await cached.dataSource.destroy();
        this.logger.log(`Tenant DataSource destroyed: ${dbName}`);
      }
    } catch (error) {
      this.logger.error(`Error destroying DataSource ${dbName}:`, error);
    } finally {
      this.tenantDataSources.delete(dbName);
    }
  }

  /**
   * Bắt đầu cleanup job để dọn dẹp các connection idle
   */
  private startCleanupJob(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleConnections().catch((err) => {
        this.logger.error('Cleanup job failed:', err);
      });
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Dọn dẹp các connection không sử dụng lâu
   */
  private async cleanupIdleConnections(): Promise<void> {
    const now = new Date();
    const toCleanup: string[] = [];

    for (const [dbName, cached] of this.tenantDataSources.entries()) {
      const idleTime = now.getTime() - cached.lastAccessed.getTime();
      if (idleTime > this.CONNECTION_IDLE_TIMEOUT) {
        toCleanup.push(dbName);
      }
    }

    if (toCleanup.length > 0) {
      this.logger.log(
        `Cleaning up ${toCleanup.length} idle tenant connections`,
      );
      for (const dbName of toCleanup) {
        await this.closeTenantDataSource(dbName);
      }
    }
  }

  /**
   * Lấy thống kê về các DataSource đang cache
   */
  getConnectionStats(): {
    totalConnections: number;
    initializingConnections: number;
    connectionDetails: Array<{
      dbName: string;
      lastAccessed: Date;
      accessCount: number;
      isInitialized: boolean;
    }>;
  } {
    return {
      totalConnections: this.tenantDataSources.size,
      initializingConnections: this.initializingDataSources.size,
      connectionDetails: Array.from(this.tenantDataSources.entries()).map(
        ([dbName, cached]) => ({
          dbName,
          lastAccessed: cached.lastAccessed,
          accessCount: cached.accessCount,
          isInitialized: cached.dataSource.isInitialized,
        }),
      ),
    };
  }

  /**
   * Đóng tất cả connections khi app shutdown
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log(
      'Destroying all tenant DataSources on application shutdown...',
    );

    // Dừng cleanup job
    clearInterval(this.cleanupInterval);

    // Đóng tất cả DataSources
    const closePromises: Promise<void>[] = [];

    for (const [dbName, cached] of this.tenantDataSources.entries()) {
      if (cached.dataSource.isInitialized) {
        closePromises.push(
          cached.dataSource.destroy().catch((error) => {
            this.logger.error(`Error destroying DataSource ${dbName}:`, error);
          }),
        );
      }
    }

    await Promise.all(closePromises);

    this.tenantDataSources.clear();
    this.initializingDataSources.clear();

    this.logger.log('All tenant DataSources destroyed successfully');
  }
}
