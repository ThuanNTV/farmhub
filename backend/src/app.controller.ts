import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/dto/dtoUsers/create-user.dto';

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Chỉ admin toàn cầu mới được truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE_MANAGER)
  @Get('admin-only')
  getAdminData(@Request() req) {
    return { message: 'This is admin-only data', user: req.user };
  }

  // Store manager và admin có thể truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @Get('manager-data')
  getManagerData(@Request() req) {
    return { message: 'Manager data', user: req.user };
  }

  // Tất cả role đã đăng nhập đều có thể xem
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
    UserRole.VIEWER,
  )
  @Get('all-users')
  getAllUsersData(@Request() req) {
    return { message: 'Data for all authenticated users', user: req.user };
  }
}
