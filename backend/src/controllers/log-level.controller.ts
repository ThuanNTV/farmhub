import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LogLevelService } from '../utils/log-level.service';
import { EnhancedAuthGuard } from '../common/auth/enhanced-auth.guard';
import { Roles } from '../core/rbac/role/roles.decorator';
import { UserRole } from '../modules/users/dto/create-user.dto';

class ChangeLogLevelDto {
  level!: 'error' | 'warn' | 'info' | 'debug';
}

@ApiTags('System Management')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard)
@Controller('system/log-level')
export class LogLevelController {
  constructor(private readonly logLevelService: LogLevelService) {}

  @Get()
  @Roles(UserRole.ADMIN_GLOBAL)
  @ApiOperation({ summary: 'Get current log level information' })
  @ApiResponse({
    status: 200,
    description: 'Current log level information',
    schema: {
      type: 'object',
      properties: {
        current: { type: 'string' },
        environment: { type: 'string' },
        recommended: { type: 'string' },
        available: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  getLogLevelInfo() {
    return {
      success: true,
      message: 'Log level information retrieved successfully',
      data: this.logLevelService.getLogLevelInfo(),
    };
  }

  @Post('change')
  @Roles(UserRole.ADMIN_GLOBAL)
  @ApiOperation({ summary: 'Change log level dynamically' })
  @ApiResponse({
    status: 200,
    description: 'Log level changed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        previousLevel: { type: 'string' },
      },
    },
  })
  changeLogLevel(@Body() changeLogLevelDto: ChangeLogLevelDto) {
    const result = this.logLevelService.setLogLevel(changeLogLevelDto.level);

    return {
      success: result.success,
      message: result.message,
      data: {
        previousLevel: result.previousLevel,
        newLevel: changeLogLevelDto.level,
      },
    };
  }

  @Post('reset')
  @Roles(UserRole.ADMIN_GLOBAL)
  @ApiOperation({ summary: 'Reset log level to environment default' })
  @ApiResponse({
    status: 200,
    description: 'Log level reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        newLevel: { type: 'string' },
      },
    },
  })
  resetLogLevel() {
    const result = this.logLevelService.resetLogLevel();

    return {
      success: result.success,
      message: result.message,
      data: {
        newLevel: result.newLevel,
      },
    };
  }

  @Get('stats')
  @Roles(UserRole.ADMIN_GLOBAL)
  @ApiOperation({ summary: 'Get log level statistics' })
  @ApiResponse({
    status: 200,
    description: 'Log level statistics',
    schema: {
      type: 'object',
      properties: {
        current: { type: 'string' },
        enabledLevels: { type: 'array', items: { type: 'string' } },
        disabledLevels: { type: 'array', items: { type: 'string' } },
        totalLevels: { type: 'number' },
      },
    },
  })
  getLogLevelStats() {
    return {
      success: true,
      message: 'Log level statistics retrieved successfully',
      data: this.logLevelService.getLogLevelStats(),
    };
  }

  @Get('test')
  @Roles(UserRole.ADMIN_GLOBAL)
  @ApiOperation({ summary: 'Test logging at different levels' })
  @ApiResponse({
    status: 200,
    description: 'Test logs generated successfully',
  })
  testLogs() {
    const timestamp = new Date().toISOString();

    // Test logs at different levels
    console.error(`[TEST ERROR] Error log test at ${timestamp}`);
    console.warn(`[TEST WARN] Warning log test at ${timestamp}`);
    console.info(`[TEST INFO] Info log test at ${timestamp}`);
    console.debug(`[TEST DEBUG] Debug log test at ${timestamp}`);

    return {
      success: true,
      message: 'Test logs generated successfully',
      data: {
        timestamp,
        currentLogLevel: this.logLevelService.getCurrentLogLevel(),
        testLevels: ['error', 'warn', 'info', 'debug'],
        note: 'Check console and log files to verify which levels are being logged',
      },
    };
  }
}
