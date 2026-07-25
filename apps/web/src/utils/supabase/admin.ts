import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase admin client (service-role). NEVER import into client
 * components. Credentials come strictly from environment variables — there are
 * no hardcoded fallbacks, and the client fails fast if either is missing so a
 * misconfigured deploy is caught immediately instead of silently using a
 * committed secret.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined. Cannot initialize Supabase admin client.');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Cannot initialize Supabase admin client.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias for HMR cache compatibility
export const getSupabaseAdmin = createAdminClient;
