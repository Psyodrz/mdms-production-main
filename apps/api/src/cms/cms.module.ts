import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { CmsSchedulerService } from './cms-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CmsController],
  providers: [CmsService, CmsSchedulerService],
  exports: [CmsService],
})
export class CmsModule {}
