import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/dto/dtoUsers/create-user.dto';

@Controller()
export class AppController {
  @Get()
  getInit() {
    Logger.log('Hello!');
    return 'Hello friend!';
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: any }): any {
    return req.user;
  }

  // Chỉ admin toàn cầu mới được truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE_MANAGER)
  @Get('admin-only')
  getAdminData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
    return { message: 'This is admin-only data', user: req.user };
  }

  // Store manager và admin có thể truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.STORE_MANAGER)
  @Get('manager-data')
  getManagerData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
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
  getAllUsersData(
    @Request() req: { user: { id: string; username: string; role: UserRole } },
  ) {
    return { message: 'Data for all authenticated users', user: req.user };
  }
}
