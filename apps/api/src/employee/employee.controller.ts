import { Controller, Get, Post, Body, Param, Patch, Req } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get()
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Roles(Role.EMPLOYEE, Role.EDITOR, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('attendance/check-in')
  async checkIn(@Req() req: any, @Body() data: { lat?: number; lng?: number; accuracy?: number }) {
    return this.employeeService.checkIn(req.user.id, data);
  }

  @Roles(Role.EMPLOYEE, Role.EDITOR, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('attendance/check-out')
  async checkOut(@Req() req: any, @Body() data: { lat?: number; lng?: number; notes?: string }) {
    return this.employeeService.checkOut(req.user.id, data);
  }

  @Roles(Role.EMPLOYEE, Role.EDITOR, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('attendance/history')
  async getMyAttendance(@Req() req: any) {
    return this.employeeService.getAttendanceHistory(req.user.id);
  }

  @Roles(Role.EMPLOYEE, Role.EDITOR, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('leave')
  async submitLeaveRequest(@Req() req: any, @Body() data: { leaveType: string; startDate: string; endDate: string; reason?: string }) {
    return this.employeeService.submitLeaveRequest(req.user.id, data);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('leave/:id/status')
  async updateLeaveStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: any) {
    return this.employeeService.updateLeaveStatus(id, status, req.user.id);
  }

  @Roles(Role.EMPLOYEE, Role.EDITOR, Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post('expense')
  async submitExpense(@Req() req: any, @Body() data: { amount: number; category: string; description?: string; projectId?: string }) {
    return this.employeeService.submitExpense(req.user.id, data);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch('expense/:id/status')
  async updateExpenseStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: any) {
    return this.employeeService.updateExpenseStatus(id, status, req.user.id);
  }
}
