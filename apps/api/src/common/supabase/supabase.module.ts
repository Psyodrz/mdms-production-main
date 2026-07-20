import { Module } from '@nestjs/common';
import { SupabaseAdminService } from './supabase-admin.service';

/**
 * Provides the Supabase Auth Admin client wrapper. ConfigModule is global, so
 * no extra imports are needed. Export the service for any module that assigns
 * or changes user roles.
 */
@Module({
  providers: [SupabaseAdminService],
  exports: [SupabaseAdminService],
})
export class SupabaseModule {}
