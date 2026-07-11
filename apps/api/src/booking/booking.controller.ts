import { Controller, Post, Get, Patch, Body, Req, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, BookingStatus } from '@mdms/types';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles(Role.CLIENT)
  @Post()
  async createBooking(
    @Req() req: any,
    @Body() body: { serviceId: string; date: string; startTime?: string; endTime?: string; projectBrief?: string; specialRequirements?: string }
  ) {
    const booking = await this.bookingService.createBooking(req.user.id, body);
    return {
      success: true,
      message: 'Booking inquiry submitted successfully',
      data: booking,
    };
  }

  @Roles(Role.CLIENT, Role.TALENT, Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Get()
  async getMyBookings(@Req() req: any) {
    const bookings = await this.bookingService.getBookingsByUser(req.user.id, req.user.role as Role);
    return {
      success: true,
      data: bookings,
    };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    const booking = await this.bookingService.updateBookingStatus(id, status);
    return {
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    };
  }
}
