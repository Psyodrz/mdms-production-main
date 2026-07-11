import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SystemService } from './system.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mdms/types';

@Controller('system')
@Roles(Role.SUPER_ADMIN)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // -- Feature Flags --
  @Get('flags')
  async getFeatureFlags() {
    return this.systemService.getFeatureFlags();
  }

  @Post('flags')
  async createFeatureFlag(@Body() data: any) {
    return this.systemService.upsertFeatureFlag(data.key, data);
  }

  // -- System Configs --
  @Get('configs')
  async getSystemConfigs() {
    return this.systemService.getSystemConfigs();
  }

  @Post('configs')
  async setSystemConfig(@Body() data: { key: string; value: string; type?: string }) {
    return this.systemService.upsertSystemConfig(data.key, data.value, data.type);
  }

  // -- Working Hours --
  @Get('working-hours')
  async getWorkingHours() {
    return this.systemService.getWorkingHours();
  }

  @Post('working-hours')
  async setWorkingHours(@Body() data: { dayOfWeek: number; startTime: string; endTime: string; isWorking?: boolean }) {
    return this.systemService.upsertWorkingHours(data.dayOfWeek, data);
  }

  // -- Blocked Dates --
  @Get('blocked-dates')
  async getBlockedDates() {
    return this.systemService.getBlockedDates();
  }

  @Post('blocked-dates')
  async addBlockedDate(@Body() data: { date: string; reason?: string }) {
    return this.systemService.addBlockedDate(data.date, data.reason);
  }

  @Delete('blocked-dates/:id')
  async removeBlockedDate(@Param('id') id: string) {
    return this.systemService.removeBlockedDate(id);
  }
}
