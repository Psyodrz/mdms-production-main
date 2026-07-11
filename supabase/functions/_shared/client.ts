import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function getSupabaseClient(authHeader?: string) {
  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const options = authHeader
    ? {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    : undefined

  return createClient(url, anonKey, options)
}

export function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
