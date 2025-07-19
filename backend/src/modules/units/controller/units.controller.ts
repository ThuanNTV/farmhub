import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UnitsService } from 'src/modules/units/service/units.service';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { RequestWithUser } from 'src/common/types/common.types';
import { CreateUnitDto } from 'src/modules/units/dto/create-unit.dto';
import { UpdateUnitDto } from 'src/modules/units/dto/update-unit.dto';
import { UnitResponseDto } from 'src/modules/units/dto/unit-response.dto';

@ApiTags('units')
@ApiBearerAuth('access-token')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({
    status: 201,
    description: 'Unit created successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createUnitDto: CreateUnitDto,
    @Request() req: RequestWithUser,
  ): Promise<UnitResponseDto> {
    const entity = await this.unitsService.create(createUnitDto, req.user.id);
    return this.unitsService.mapToResponseDto(entity);
  }

  @Get()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({
    status: 200,
    description: 'Return all units',
    type: [UnitResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<UnitResponseDto[]> {
    const entities = await this.unitsService.findAll();
    return entities.map((e) => this.unitsService.mapToResponseDto(e));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER, UserRole.STORE_STAFF)
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Get a unit by id' })
  @ApiResponse({
    status: 200,
    description: 'Unit found',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<UnitResponseDto> {
    const entity = await this.unitsService.findOne(id);
    return this.unitsService.mapToResponseDto(entity);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit updated successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @Request() req: RequestWithUser,
  ): Promise<UnitResponseDto> {
    const entity = await this.unitsService.update(
      id,
      updateUnitDto,
      req.user.id,
    );
    return this.unitsService.mapToResponseDto(entity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN_GLOBAL)
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Soft delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.unitsService.remove(id, req.user.id);
    return { message: 'Xóa thành công' };
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Restore a soft deleted unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit restored successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found or not deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restore(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<UnitResponseDto> {
    const entity = await this.unitsService.restore(id, req.user.id);
    return this.unitsService.mapToResponseDto(entity);
  }
}
