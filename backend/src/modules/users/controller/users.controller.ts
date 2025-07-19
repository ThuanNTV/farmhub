import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnhancedAuthGuard } from 'src/common/auth/enhanced-auth.guard';
import { PermissionGuard } from 'src/core/rbac/permission/permission.guard';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { RequireUserPermission } from 'src/core/rbac/permission/permissions.decorator';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { UsersService } from 'src/core/user/service/users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(EnhancedAuthGuard, PermissionGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('access-token')
export class UsersController {
  findOneUsernameOrEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequireUserPermission('create')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo user thành công',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @RequireUserPermission('list')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy danh sách users' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Không có quyền xem danh sách' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy thông tin user theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem user' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Cập nhật user' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @RequireUserPermission('delete')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Xóa user' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa' })
  async remove(@Param('id') id: string) {
    return this.usersService.removeUser(id);
  }

  @Patch(':id/restore')
  @RequireUserPermission('update')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Khôi phục user đã xóa mềm' })
  @ApiResponse({ status: 200, description: 'Khôi phục thành công' })
  @ApiResponse({
    status: 404,
    description: 'User không tồn tại hoặc chưa bị xóa mềm',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền khôi phục' })
  async restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }

  @Get('store/:storeId')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy users theo store' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users của store',
    type: [UserResponseDto],
  })
  async findByStore(@Param('storeId') storeId: string) {
    return this.usersService.findByStore(storeId);
  }

  @Get('role/:role')
  @RequireUserPermission('read')
  @RateLimitAPI()
  @ApiOperation({ summary: 'Lấy users theo role' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users theo role',
    type: [UserResponseDto],
  })
  async findByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }
}
