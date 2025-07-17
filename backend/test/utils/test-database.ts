import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export class TestDatabase {
  private static dataSource: DataSource | null = null;

  static async initialize(): Promise<DataSource> {
    if (this.dataSource) {
      return this.dataSource;
    }

    const configService = new ConfigService();

    this.dataSource = new DataSource({
      type: 'postgres',
      host: configService.get('DB_HOST') ?? 'localhost',
      port: configService.get('DB_PORT') ?? 5432,
      username: configService.get('DB_USERNAME') ?? 'test',
      password: configService.get('DB_PASSWORD') ?? 'test',
      database: configService.get('DB_DATABASE') ?? 'farmhub_test',
      entities: ['src/entities/**/*.entity.ts'],
      synchronize: true,
      dropSchema: true,
      logging: false,
    });

    await this.dataSource.initialize();
    return this.dataSource;
  }

  static async cleanup(): Promise<void> {
    if (this.dataSource) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }
  }

  static async clearTables(): Promise<void> {
    if (!this.dataSource) {
      return;
    }

    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  static getDataSource(): DataSource | null {
    return this.dataSource;
  }
}
