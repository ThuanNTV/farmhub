import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { RedisCacheService } from './common/cache/redis-cache.service';
import {
  RequestWithUser,
  RequestUser,
  RedisStats,
} from 'src/common/types/common.types';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { Roles } from 'src/core/rbac/role/roles.decorator';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectDataSource('globalConnection')
    private readonly globalDataSource: DataSource,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @Get()
  getHello(): string {
    return 'FarmHub Backend API is running!';
  }

  @Get('health')
  async getHealth() {
    try {
      const globalDbHealthy = this.globalDataSource.isInitialized;

      // Test Redis connection
      let redisHealthy = false;
      let redisStats: RedisStats | null = null;
      try {
        await this.redisCacheService.get('health:test');
        redisHealthy = true;
        redisStats = await this.redisCacheService.getStats();
      } catch (error) {
        this.logger.error('Redis health check failed:', error);
      }

      const allHealthy = globalDbHealthy && redisHealthy;

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          globalDatabase: globalDbHealthy ? 'connected' : 'disconnected',
          redis: redisHealthy ? 'connected' : 'disconnected',
        },
        redis: redisStats
          ? {
              connected_clients: redisStats.stats?.connected_clients,
              used_memory: redisStats.stats?.used_memory,
              keyspace_hits: redisStats.stats?.keyspace_hits,
              keyspace_misses: redisStats.stats?.keyspace_misses,
            }
          : null,
        uptime: process.uptime(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          globalDatabase: 'error',
          redis: 'error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        uptime: process.uptime(),
      };
    }
  }

  @Get('health/db')
  getDatabaseHealth() {
    try {
      const isHealthy = this.globalDataSource.isInitialized;
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        globalDatabase: isHealthy ? 'connected' : 'disconnected',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        globalDatabase: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('health/redis')
  async getRedisHealth() {
    try {
      // Test Redis connection
      await this.redisCacheService.get('health:test');

      // Get Redis statistics
      const redisStats: RedisStats | null =
        await this.redisCacheService.getStats();

      if (redisStats?.stats) {
        const hitRate =
          redisStats.stats.keyspace_hits /
          (redisStats.stats.keyspace_hits + redisStats.stats.keyspace_misses);

        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          redis: 'connected',
          statistics: {
            connected_clients: redisStats.stats.connected_clients,
            used_memory: redisStats.stats.used_memory,
            keyspace_hits: redisStats.stats.keyspace_hits,
            keyspace_misses: redisStats.stats.keyspace_misses,
            hit_rate: `${(hitRate * 100).toFixed(2)}%`,
          },
        };
      } else {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          redis: 'connected',
          statistics: 'unavailable',
        };
      }
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        redis: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  getProfile(@Request() req: RequestWithUser): RequestUser {
    return req.user;
  }

  // Chỉ admin toàn cầu mới được truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN_GLOBAL)
  @Get('admin-only')
  getAdminData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
    return { message: 'This is admin-only data', user: req.user };
  }

  // Store manager và admin có thể truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @Get('manager-data')
  getManagerData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
    return { message: 'Manager data', user: req.user };
  }

  // Tất cả role đã đăng nhập đều có thể xem
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @Get('all-users')
  getAllUsersData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
    return { message: 'Data for all authenticated users', user: req.user };
  }
}
