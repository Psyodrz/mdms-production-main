import { Controller, Get, Query, Param, Body, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';
import { PaginateUsersDto } from './dto/paginate-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async listUsers(@Query() dto: PaginateUsersDto) {
    const data = await this.adminService.listUsers(dto);
    return { success: true, ...data };
  }

  @Post('users')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createUser(@Body() dto: CreateUserDto, @Req() req: any) {
    const data = await this.adminService.createUser(dto, req.user);
    return { success: true, data };
  }

  @Patch('users/:id/role')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserRole(id, dto.role, req.user);
  }

  @Patch('users/:id/deactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deactivateUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.deactivateUser(id, req.user);
  }

  @Patch('users/:id/reactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async reactivateUser(@Param('id') id: string, @Req() req: any) {
    return this.adminService.reactivateUser(id, req.user);
  }

  @Post('users/:id/reset-mfa')
  @Roles(Role.SUPER_ADMIN)
  async resetMfa(@Param('id') id: string, @Req() req: any) {
    return this.adminService.resetMfa(id, req.user);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get('dashboard/kpis')
  async getDashboardKpis() {
    const data = await this.adminService.getDashboardKpis();
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get('stats')
  async getStats() {
    const data = await this.adminService.getDashboardKpis();
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get('dashboard/recent-bookings')
  async getRecentBookings() {
    const data = await this.adminService.getRecentBookings();
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('audit-logs')
  async getAuditLogs(@Query('page') page?: string, @Query('limit') limit?: string, @Query('action') action?: string, @Query('userId') userId?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const data = await this.adminService.getAuditLogs(pageNum, limitNum, action, userId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get('projects')
  async listProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const data = await this.adminService.listProjects(pageNum, limitNum, status, search);
    return { success: true, ...data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    const data = await this.adminService.getProjectById(id);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('projects/:id/status')
  async updateProjectStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    const data = await this.adminService.updateProjectStatus(id, status, req.user);
    return { success: true, data };
  }
}
