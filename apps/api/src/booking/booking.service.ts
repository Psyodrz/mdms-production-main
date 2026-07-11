import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role } from '@mdms/types';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService
  ) {}

  async createBooking(clientId: string, data: { serviceId: string; date: string; startTime?: string; endTime?: string; projectBrief?: string; specialRequirements?: string }) {
    const client = await this.prisma.client.findUnique({ 
      where: { userId: clientId },
      include: { user: true }
    });
    if (!client) throw new ForbiddenException('User is not a registered client');

    const booking = await this.prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: data.serviceId,
        status: BookingStatus.INQUIRY,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        projectBrief: data.projectBrief,
        specialRequirements: data.specialRequirements,
      },
    });

    if (client.user.phone) {
      this.whatsappService.sendMessage(
        client.user.phone,
        `Hi ${client.user.firstName}, your booking inquiry for the service has been received by MP Production. We will contact you soon with availability and a quote.`
      );
    }

    return booking;
  }

  async getBookingsByUser(userId: string, role: Role) {
    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client) throw new ForbiddenException('Client not found');
      return this.prisma.booking.findMany({
        where: { clientId: client.id },
        include: { service: true, client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    // For admins and PMs to see all
    return this.prisma.booking.findMany({
      include: {
        client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ 
      where: { id: bookingId },
      include: {
        client: {
          include: { user: true }
        }
      }
    });
    
    if (!booking) throw new NotFoundException('Booking not found');

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (booking.client.user.phone) {
      this.whatsappService.sendMessage(
        booking.client.user.phone,
        `Update from MP Production: Your booking inquiry status has been changed to ${status.replace('_', ' ')}.`
      );
    }

    return updated;
  }
}
