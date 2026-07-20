-- ============================================================================
-- Supabase Realtime + admin-scoped RLS for the super-admin CMS live updates.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor). This script is
-- IDEMPOTENT — safe to run multiple times. It:
--   1. Adds the CMS tables to the Realtime publication (only if not already in).
--   2. Enables Row Level Security on them.
--   3. Backfills app_metadata.role from user_metadata.role (uppercased) so the
--      policy has something to match. app_metadata is NOT user-editable.
--   4. Grants SELECT only to authenticated ADMIN / SUPER_ADMIN users — this is
--      what gates who receives Realtime "postgres_changes" events. The check is
--      case-insensitive so 'admin' / 'ADMIN' / 'super_admin' all work.
--
-- Table names are PascalCase because Prisma maps models 1:1 (no @@map), so they
-- MUST be double-quoted in Postgres.
--
-- SAFE FOR THE NESTJS BACKEND: Prisma connects with the privileged `postgres`
-- role (via DATABASE_URL), which bypasses RLS. These policies only affect
-- clients that connect through Supabase (PostgREST / Realtime), i.e. the
-- browser.
--
-- AFTER RUNNING: sign out and back in on the admin account. The access token
-- (JWT) only picks up the new app_metadata on a fresh login/refresh.
-- ============================================================================

-- 1. Enable Realtime replication (skip tables already in the publication) --------
do $$
declare
  t text;
  tables text[] := array['Booking', 'Testimonial', 'PortfolioItem'];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- 2. Turn on RLS (no-op if already enabled) --------------------------------------
alter table "Booking"       enable row level security;
alter table "Testimonial"   enable row level security;
alter table "PortfolioItem" enable row level security;

-- 3. Backfill app_metadata.role from user_metadata.role (uppercased) -------------
-- Copies the role into the non-user-editable app_metadata for every user that
-- has a role in user_metadata. Re-runnable; safe to run again after new signups.
update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', upper(raw_user_meta_data ->> 'role'))
where raw_user_meta_data ->> 'role' is not null;

-- 4. Admin-only SELECT policy (case-insensitive; drop-then-create) ----------------
drop policy if exists "admin_realtime_read_booking" on "Booking";
create policy "admin_realtime_read_booking"
  on "Booking" for select to authenticated
  using ( upper(auth.jwt() -> 'app_metadata' ->> 'role') in ('ADMIN', 'SUPER_ADMIN') );

drop policy if exists "admin_realtime_read_testimonial" on "Testimonial";
create policy "admin_realtime_read_testimonial"
  on "Testimonial" for select to authenticated
  using ( upper(auth.jwt() -> 'app_metadata' ->> 'role') in ('ADMIN', 'SUPER_ADMIN') );

drop policy if exists "admin_realtime_read_portfolio" on "PortfolioItem";
create policy "admin_realtime_read_portfolio"
  on "PortfolioItem" for select to authenticated
  using ( upper(auth.jwt() -> 'app_metadata' ->> 'role') in ('ADMIN', 'SUPER_ADMIN') );

-- ============================================================================
-- VERIFY (optional) — after running, both admins should show an app_role:
--
--   select email,
--          raw_app_meta_data->>'role'  as app_role,
--          raw_user_meta_data->>'role' as user_role
--   from auth.users
--   where raw_user_meta_data->>'role' ilike '%admin%';
--
-- NOTE: This backfill covers existing users. NEW signups still need their role
-- written to app_metadata — that is what the automated backend sync (service
-- role → auth.admin.updateUserById) handles going forward.
-- ============================================================================
