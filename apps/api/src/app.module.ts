import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Global RBAC guards
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Core infrastructure modules
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ProjectsModule } from './projects/projects.module';
import { PaymentsModule } from './payments/payments.module';
import { TalentModule } from './talent/talent.module';
import { FileModule } from './file/file.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { CmsModule } from './cms/cms.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { HealthModule } from './health/health.module';
import { BookingModule } from './booking/booking.module';
import { ClientModule } from './client/client.module';
import { ProjectModule } from './project/project.module';
import { AdminModule } from './admin/admin.module';
import { EmployeeModule } from './employee/employee.module';
import { EditorModule } from './editor/editor.module';
import { SystemModule } from './system/system.module';
import { TalentCategoryModule } from './talent-category/talent-category.module';

@Module({
  imports: [
    // Configuration — loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting — 100 req/min auth, 20 req/min unauth
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,  // 1 second
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100,
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000,
      },
    ]),

    // Infrastructure
    PrismaModule,
    RedisModule,

    // Features
    AuthModule,
    UsersModule,
    BookingsModule,
    ProjectsModule,
    PaymentsModule,
    TalentModule,
    FileModule,
    NotificationsModule,
    AuditModule,
    CmsModule,
    WhatsappModule,
    HealthModule,
    BookingModule,
    ClientModule,
    ProjectModule,
    AdminModule,
    EmployeeModule,
    EditorModule,
    SystemModule,
    TalentCategoryModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global authentication — every route requires a valid JWT unless marked @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global RBAC — enforces @Roles() metadata (runs after JwtAuthGuard populates req.user)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
