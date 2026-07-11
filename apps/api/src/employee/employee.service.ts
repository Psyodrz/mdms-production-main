import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService
  ) {}

  async getAllEmployees() {
    return this.prisma.employee.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } }
    });
  }

  async getEmployeeById(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true, attendance: { take: 10, orderBy: { checkInAt: 'desc' } } }
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  private async getEmployeeByUserId(userId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { userId } });
    if (!emp) throw new NotFoundException('Employee record not found for this user');
    return emp;
  }

  async checkIn(userId: string, data: { lat?: number; lng?: number; accuracy?: number }) {
    const emp = await this.getEmployeeByUserId(userId);
    
    // Check if already checked in today without checking out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await this.prisma.attendance.findFirst({
      where: {
        employeeId: emp.id,
        checkInAt: { gte: today },
        checkOutAt: null
      }
    });

    if (existing) {
      throw new BadRequestException('You are already checked in.');
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: emp.id,
        checkInAt: new Date(),
        checkInLat: data.lat,
        checkInLng: data.lng,
        checkInAccuracy: data.accuracy,
      }
    });
  }

  async checkOut(userId: string, data: { lat?: number; lng?: number; notes?: string }) {
    const emp = await this.getEmployeeByUserId(userId);
    
    // Find open check-in
    const openAttendance = await this.prisma.attendance.findFirst({
      where: { employeeId: emp.id, checkOutAt: null },
      orderBy: { checkInAt: 'desc' }
    });

    if (!openAttendance) {
      throw new BadRequestException('No open check-in found to check out from.');
    }

    const checkOutAt = new Date();
    const durationMin = Math.round((checkOutAt.getTime() - openAttendance.checkInAt.getTime()) / 60000);

    return this.prisma.attendance.update({
      where: { id: openAttendance.id },
      data: {
        checkOutAt,
        checkOutLat: data.lat,
        checkOutLng: data.lng,
        durationMin,
        notes: data.notes
      }
    });
  }

  async getAttendanceHistory(userId: string) {
    const emp = await this.getEmployeeByUserId(userId);
    return this.prisma.attendance.findMany({
      where: { employeeId: emp.id },
      orderBy: { checkInAt: 'desc' }
    });
  }

  async submitLeaveRequest(userId: string, data: { leaveType: string; startDate: string; endDate: string; reason?: string }) {
    const emp = await this.getEmployeeByUserId(userId);
    return this.prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveType: data.leaveType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'PENDING'
      }
    });
  }

  async updateLeaveStatus(leaveId: string, status: any, approvedByUserId: string) {
    const leave = await this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, approvedById: approvedByUserId },
      include: { employee: { include: { user: true } } }
    });

    if (leave.employee.user.phone) {
      this.whatsappService.sendMessage(
        leave.employee.user.phone,
        `MP Production HR: Your leave request from ${leave.startDate.toLocaleDateString()} has been ${status}.`
      );
    }

    return leave;
  }

  async submitExpense(userId: string, data: { amount: number; category: string; description?: string; projectId?: string }) {
    const emp = await this.getEmployeeByUserId(userId);
    return this.prisma.expenseClaim.create({
      data: {
        employeeId: emp.id,
        amount: data.amount,
        category: data.category,
        description: data.description,
        projectId: data.projectId,
        status: 'SUBMITTED'
      }
    });
  }

  async updateExpenseStatus(expenseId: string, status: any, approvedByUserId: string) {
    const expense = await this.prisma.expenseClaim.update({
      where: { id: expenseId },
      data: { status, approvedById: approvedByUserId },
      include: { employee: { include: { user: true } } }
    });

    if (expense.employee.user.phone) {
      this.whatsappService.sendMessage(
        expense.employee.user.phone,
        `MP Production HR: Your expense claim of ₹${expense.amount / 100} has been ${status}.`
      );
    }

    return expense;
  }
}
