import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@mdms/types';

/**
 * Thin wrapper over the Supabase Auth Admin REST API used to keep a user's role
 * in sync inside `app_metadata` (which, unlike `user_metadata`, is NOT editable
 * by the user themselves). The super-admin CMS Realtime RLS policies read the
 * role from `app_metadata`, so every role assignment must be mirrored here.
 *
 * Uses the service-role key (server-only, never exposed to the browser). If the
 * required env vars are missing the calls become no-ops with a warning, so role
 * changes in our own DB never fail just because Supabase sync is unconfigured.
 */
@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private readonly baseUrl: string | null;
  private readonly serviceKey: string | null;
  private warnedMissingConfig = false;

  constructor(private readonly config: ConfigService) {
    const explicitUrl = this.config.get<string>('SUPABASE_URL');
    const projectId = this.config.get<string>('SUPABASE_PROJECT_ID');
    const derivedUrl = projectId ? `https://${projectId}.supabase.co` : undefined;

    this.baseUrl = (explicitUrl || derivedUrl)?.replace(/\/$/, '') ?? null;
    this.serviceKey =
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ??
      this.config.get<string>('SUPABASE_SERVICE_KEY') ??
      null;
  }

  private isConfigured(): boolean {
    if (this.baseUrl && this.serviceKey) return true;
    if (!this.warnedMissingConfig) {
      this.logger.warn(
        'Supabase admin sync is not configured (need SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL/SUPABASE_PROJECT_ID). Role → app_metadata sync is disabled.',
      );
      this.warnedMissingConfig = true;
    }
    return false;
  }

  /**
   * Mirror a user's role into Supabase `app_metadata.role` (uppercased to match
   * the RLS policy). Never throws — logs and returns on failure so the caller's
   * primary operation (the DB role change) is unaffected.
   */
  async syncUserRole(userId: string, role: Role | string): Promise<void> {
    if (!userId || !this.isConfigured()) return;

    const normalizedRole = String(role).toUpperCase();
    const url = `${this.baseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.serviceKey as string,
          Authorization: `Bearer ${this.serviceKey}`,
        },
        body: JSON.stringify({ app_metadata: { role: normalizedRole } }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        this.logger.error(
          `Failed to sync role to Supabase app_metadata for user ${userId} (status ${res.status}). ${detail}`,
        );
        return;
      }

      this.logger.log(`Synced role ${normalizedRole} to Supabase app_metadata for user ${userId}.`);
    } catch (err) {
      this.logger.error(
        `Error syncing role to Supabase app_metadata for user ${userId}`,
        err as Error,
      );
    }
  }
}
