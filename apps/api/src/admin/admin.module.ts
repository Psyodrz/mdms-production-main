import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [PrismaModule, AuditModule, SupabaseModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
