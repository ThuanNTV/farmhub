import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { RateLimitGuard } from 'src/common/auth/rate-limit.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { CreateJobScheduleDto } from 'src/modules/job-schedules/dto/create-jobSchedule.dto';
import { UpdateJobScheduleDto } from 'src/modules/job-schedules/dto/update-jobSchedule.dto';
import { JobScheduleResponseDto } from 'src/modules/job-schedules/dto/jobSchedule-response.dto';
import { JobSchedulesService } from 'src/modules/job-schedules/service/job-schedules.service';

@ApiTags('Job Schedules')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/job-schedules')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@UseInterceptors(AuditInterceptor)
export class JobSchedulesController {
  constructor(private readonly service: JobSchedulesService) {}

  @Post()
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job schedule' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'Job schedule created successfully',
    type: JobScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateJobScheduleDto,
  ): Promise<JobScheduleResponseDto> {
    return await this.service.createJobSchedule(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get all job schedules' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'Job schedules retrieved successfully',
    type: [JobScheduleResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<JobScheduleResponseDto[]> {
    return await this.service.findAllJobSchedules(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get job schedule by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Job Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Job schedule retrieved successfully',
    type: JobScheduleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job schedule not found' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<JobScheduleResponseDto> {
    return await this.service.findOne(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Update job schedule' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Job Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Job schedule updated successfully',
    type: JobScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job schedule not found' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobScheduleDto,
  ): Promise<JobScheduleResponseDto> {
    return await this.service.updateJobSchedule(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job schedule' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'Job Schedule ID' })
  @ApiResponse({
    status: 204,
    description: 'Job schedule deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Job schedule not found' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.removeJobSchedule(storeId, id);
  }
}
