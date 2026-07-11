import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Role } from '@mdms/types';
import { PaginateUsersDto } from './dto/paginate-users.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listUsers(dto: PaginateUsersDto) {
    const { page = 1, limit = 20, search, role } = dto;
    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createUser(dto: { id?: string; email: string; firstName: string; lastName?: string; role: Role }, actor: any) {
    // Only SUPER_ADMIN may create ADMIN or SUPER_ADMIN accounts.
    if (actor.role !== Role.SUPER_ADMIN && (dto.role === Role.ADMIN || dto.role === Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN accounts.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // If a Supabase id is supplied and differs from an existing row's id, align it.
    if (existing && dto.id && existing.id !== dto.id) {
      await this.prisma.user.update({ where: { email: dto.email }, data: { id: dto.id } });
    }

    const user = await this.prisma.user.upsert({
      where: dto.id ? { id: dto.id } : { email: dto.email },
      update: { role: dto.role, firstName: dto.firstName, lastName: dto.lastName ?? '', isActive: true },
      create: {
        ...(dto.id ? { id: dto.id } : {}),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName ?? '',
        role: dto.role,
        isActive: true,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    });

    await this.auditService.log({
      actorId: actor.id,
      action: 'CREATE_USER',
      resource: 'User',
      resourceId: user.id,
      after: { email: user.email, role: user.role },
    });
    return user;
  }

  async updateUserRole(userId: string, newRole: Role, actor: any) {
    // Guard: ADMIN cannot promote anyone to SUPER_ADMIN
    if (actor.role !== Role.SUPER_ADMIN && newRole === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can assign the SUPER_ADMIN role.');
    }
    
    const originalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    await this.auditService.log({
      actorId: actor.id,
      action: 'UPDATE_USER_ROLE',
      resource: 'User',
      resourceId: userId,
      before: originalUser ? { role: originalUser.role } : undefined,
      after: { role: newRole },
    });
    return user;
  }

  async deactivateUser(userId: string, actor: any) {
    if (userId === actor.id) {
      throw new BadRequestException('Cannot deactivate your own account.');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    await this.auditService.log({
      actorId: actor.id,
      action: 'DEACTIVATE_USER',
      resource: 'User',
      resourceId: userId,
      after: { isActive: false },
    });
    return user;
  }

  async reactivateUser(userId: string, actor: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
    await this.auditService.log({
      actorId: actor.id,
      action: 'REACTIVATE_USER',
      resource: 'User',
      resourceId: userId,
      after: { isActive: true },
    });
    return user;
  }

  async resetMfa(userId: string, actor: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: null, mfaEnabled: false },
    });
    await this.auditService.log({
      actorId: actor.id,
      action: 'RESET_MFA',
      resource: 'User',
      resourceId: userId,
      after: { mfaEnabled: false, mfaSecret: null },
    });
    return { message: 'MFA reset successfully.' };
  }

  async getDashboardKpis() {
    const [activeProjects, pendingBookings, totalTalent, payments, totalPortfolio, totalBlog, totalTestimonials, totalServices, unreadContacts] = await Promise.all([
      this.prisma.project.count({
        where: {
          status: {
            notIn: ['COMPLETED', 'DELIVERED']
          }
        }
      }),
      this.prisma.booking.count({
        where: {
          status: 'INQUIRY'
        }
      }),
      this.prisma.user.count({
        where: { role: 'TALENT' }
      }),
      this.prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true }
      }),
      this.prisma.portfolioItem.count({ where: { deletedAt: null } }),
      this.prisma.blogPost.count({ where: { deletedAt: null } }),
      this.prisma.testimonial.count({ where: { deletedAt: null } }),
      this.prisma.service.count({ where: { deletedAt: null } }),
      this.prisma.contactSubmission.count({ where: { isRead: false, deletedAt: null } })
    ]);

    const totalPaise = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRupees = Math.round(totalPaise / 100);
    const formattedRevenue = totalRupees >= 100000 ? `₹${(totalRupees / 100000).toFixed(1)}L` : `₹${totalRupees.toLocaleString('en-IN')}`;

    return {
      activeProjects,
      pendingBookings,
      totalTalent,
      totalRevenue: formattedRevenue,
      totalPortfolio,
      totalBlog,
      totalTestimonials,
      totalServices,
      unreadContacts
    };
  }

  async getRecentBookings() {
    return this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        service: true,
        client: {
          include: { user: true }
        }
      }
    });
  }

  async getAuditLogs(page = 1, limit = 50, action?: string, userId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.actorId = userId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      }),
      this.prisma.auditLog.count({ where })
    ]);

    const formatted = logs.map(l => ({
      id: l.id,
      userId: l.actorId,
      userName: l.actor ? `${l.actor.firstName || ''} ${l.actor.lastName || ''}`.trim() || l.actor.email : 'System Admin',
      action: l.action,
      entity: l.resource,
      entityId: l.resourceId,
      before: l.before,
      after: l.after,
      createdAt: l.createdAt
    }));

    return {
      items: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async listProjects(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              client: {
                include: { user: { select: { firstName: true, lastName: true, email: true } } }
              },
              service: { select: { name: true, category: true } },
            },
          },
          milestones: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { versions: true, comments: true, payments: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getProjectById(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        booking: {
          include: {
            client: {
              include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } }
            },
            service: true,
          },
        },
        milestones: { orderBy: { sortOrder: 'asc' } },
        versions: { orderBy: { versionNumber: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { author: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async updateProjectStatus(projectId: string, status: string, actor: any) {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: status as any,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });
    await this.auditService.log({
      actorId: actor.sub || actor.id,
      action: 'UPDATE_PROJECT_STATUS',
      resource: 'Project',
      resourceId: projectId,
      after: { status },
    });
    return project;
  }
}
