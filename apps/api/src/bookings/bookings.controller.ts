import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';
import { CreateCastingCallDto } from './dto/create-casting-call.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Post('casting-calls')
  async createCastingCall(@Req() req: any, @Body() dto: CreateCastingCallDto) {
    const call = await this.prisma.castingCall.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectType: dto.projectType,
        city: dto.city,
        location: dto.location,
        compensationType: dto.compensationType,
        compensationDetails: dto.compensationDetails,
        slotsAvailable: dto.slotsAvailable ?? 1,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        shootDate: dto.shootDate ? new Date(dto.shootDate) : undefined,
        status: 'PUBLISHED',
        createdById: req.user.id,
      },
    });
    return { success: true, message: 'Casting call published', data: call };
  }

  @Roles(Role.CLIENT, Role.TALENT, Role.SUPER_ADMIN, Role.ADMIN)
  @Get('casting-calls')
  async getCastingCalls(@Req() req: any) {
    let whereClause: any = {};
    if (req.user.role === Role.CLIENT) {
      whereClause = { createdById: req.user.id };
    } else if (req.user.role === Role.TALENT) {
      whereClause = { status: 'PUBLISHED' };
    }

    const castingCalls = await this.prisma.castingCall.findMany({
      where: whereClause,
      include: {
        applications: {
          include: {
            talent: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: castingCalls,
    };
  }
}
