'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Subscribe to Supabase Realtime Postgres changes and trigger a refresh.
 *
 * The pattern here is "subscribe → refresh via BFF": Realtime is used only as a
 * lightweight signal that *something* changed. When an event fires we call the
 * provided `onChange` (which re-runs the existing secure BFF loaders), so all
 * data still flows browser → BFF → API and never trusts the Realtime payload
 * for anything sensitive.
 *
 * AUTH: the channel authenticates with the logged-in user's Supabase session
 * access token (via realtime.setAuth), NOT the public anon key. This lets the
 * RLS policy on these tables be scoped to the admin role so only authenticated
 * admins receive change events.
 *
 * Table names are the raw Postgres table names. Prisma maps models 1:1 without
 * @@map, so they are PascalCase: 'Booking', 'Testimonial', 'PortfolioItem'.
 *
 * NOTE: Realtime must be enabled for these tables in the Supabase dashboard
 * (Database → Replication). The admin role needs a SELECT policy or change
 * events are silently dropped.
 */
export function useRealtimeRefresh(
  tables: string[],
  onChange: () => void,
  options: { debounceMs?: number; enabled?: boolean } = {},
): { connected: boolean } {
  const { debounceMs = 800, enabled = true } = options;
  const [connected, setConnected] = useState(false);

  // Keep the latest callback in a ref so re-renders don't re-subscribe.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable key so the effect only re-runs when the table set actually changes.
  const tablesKey = tables.join(',');

  useEffect(() => {
    if (!enabled || tables.length === 0) return;

    const supabase = createClient();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const scheduleRefresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        onChangeRef.current();
      }, debounceMs);
    };

    const subscribe = async () => {
      // Authenticate the Realtime socket as the logged-in admin. Without a
      // session token the connection would fall back to the anon role, which
      // must NOT be allowed to read admin data.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Not logged in with a Supabase session — do not open an anon channel.
        setConnected(false);
        return;
      }
      supabase.realtime.setAuth(session.access_token);

      if (cancelled) return;

      // Postgres Changes delivery is gated by each table's RLS SELECT policy
      // evaluated against this authenticated socket, so an admin-scoped policy
      // is what keeps non-admins from receiving events.
      channel = supabase.channel(`realtime-refresh:${tablesKey}`);

      for (const table of tables) {
        channel.on(
          'postgres_changes' as never,
          { event: '*', schema: 'public', table } as never,
          scheduleRefresh as never,
        );
      }

      channel.subscribe((status: string) => {
        setConnected(status === 'SUBSCRIBED');
      });
    };

    // Keep the socket auth fresh when Supabase rotates the access token.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });

    subscribe();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      authListener?.subscription?.unsubscribe();
      if (channel) supabase.removeChannel(channel);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey, enabled, debounceMs]);

  return { connected };
}
