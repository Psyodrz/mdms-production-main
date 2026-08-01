# MP Production (MDMS) — Technical Documentation

Media & Digital Management System — a Turborepo monorepo powering a public
marketing site, a talent marketplace, client/editor/employee/PM portals, and an
admin/super-admin CMS.

## 1. Project architecture

```
┌────────────┐      Supabase JWT       ┌─────────────────┐
│  Next.js    │  ───────────────────▶  │   NestJS API     │
│  (apps/web) │      Bearer token       │  (apps/api)      │
│             │                         │  Prisma + Redis  │
│  ┌────────┐ │   NextAuth session      └───────┬─────────┘
│  │ BFF    │ │  (service acct → API)           │
│  │/api/*  │ │                          ┌───────▼─────────┐
│  └────────┘ │                          │  PostgreSQL      │
└─────┬───────┘                          │  Redis           │
      │ Supabase Auth + Storage          └──────────────────┘
      ▼
┌──────────────┐
│  Supabase    │  auth (email/OAuth), storage buckets
└──────────────┘
```

- **apps/web** — Next.js App Router. Public pages + role dashboards. Two API surfaces:
  direct calls to the NestJS API (`lib/api-client`, Supabase-token auth) and a
  same-origin **BFF** (`app/api/*`) used by the CMS (NextAuth session → service account).
- **apps/api** — NestJS, global prefix `/api/v1`, Prisma ORM, Redis, global
  `JwtAuthGuard`→`RolesGuard`, `ResponseInterceptor`, `HttpExceptionFilter`.
- **packages/types** — shared `Role` enum + domain enums (`@mdms/types`).

## 2. Folder structure
```
apps/
  api/src/
    admin/ audit/ auth/ booking/ bookings/ client/ cms/ editor/ employee/
    file/ health/ payments/ project/ system/ talent/ talent-category/ users/ whatsapp/
    common/ (guards, decorators, interceptors, filters, dto, supabase)
    prisma/ (PrismaService)  main.ts  app.module.ts
  web/src/
    app/            # routes (public, (auth), portals, admin, super-admin, api BFF)
    components/     # DashboardLayout, Sidebar, ui/*, admin/*, talent-registration/*, dashboard/widgets
    lib/            # api-client, server-api-client, cms/(client, resources, server/*), upload, security
    utils/supabase/ # client, server, admin
    middleware.ts
packages/ types · config · design-tokens
prisma/schema.prisma
e2e/                # Playwright suite
docs/               # this documentation
```

## 3. Authentication flow
1. User signs in on `/login` (`AuthForm`) via `supabase.auth.signInWithPassword` (or Google/Apple OAuth).
2. Supabase returns a session; the access token is stored (localStorage `token` + Supabase `sb-*-auth-token`).
3. Client → API calls attach `Authorization: Bearer <token>` via `fetchAPI`/`serverFetchAPI`.
4. The NestJS `JwtAuthGuard` validates the Supabase JWT; `@Public()` routes bypass it.
5. Post-login redirect is role-based (`AuthForm` + `middleware.getDashboardUrl`).
6. Registration (`/api/auth/register` BFF → Supabase Admin) creates the auth user; a DB
   trigger mirrors it into the Prisma `User` table.

## 4. Authorization / RBAC flow
- **Edge (middleware.ts):** `ROLE_ROUTES` maps route prefixes → allowed roles. Unauthenticated
  users on protected routes → `/login`; authenticated-but-unauthorized → their own dashboard.
  Role casing is normalized to UPPERCASE. `/studio-8f2k` and `/studio-8f2k/mgmt` rewrite to
  `/super-admin` and `/admin` (obfuscated admin entry).
- **API (NestJS):** global `JwtAuthGuard`→`RolesGuard`; `@Roles(...)` on controllers/handlers,
  `@Public()` to opt out. Actor-sensitive rules (e.g., only SUPER_ADMIN grants SUPER_ADMIN,
  cannot self-deactivate) live in the services.
- **BFF (CMS):** `requireAdmin()` checks the NextAuth session role; requests are proxied to the
  API using a dedicated **service account** (`CMS_SERVICE_EMAIL/PASSWORD`). Intentional design.

## 5. CMS architecture
- Config-driven: `lib/cms/resources.ts` defines every resource (fields, columns, backend paths, capabilities).
- UI: `ResourceManager` (list/search/paginate/create/edit/delete + publish toggle) + `ResourceForm`.
- Transport: `cms` client → same-origin `/api/cms/[resource]` BFF → `backendFetch` (service account) → NestJS `/cms/admin/*`.
- Real backend errors propagate (no fabricated success). Pagination forwards `page`/`limit`;
  responses carry `{ data, total, page, totalPages }`.
- Site config (hero/footer/pricing/navbar=`navigation`/seo/stats/showreels) via `/cms/admin/config/:key` (SystemConfig).

## 6. Dashboard architecture
- Shared `DashboardLayout` (top nav + command palette + sign-out) + role-based `Sidebar` (`getNavItems()` per role).
- Role dashboards are tab-based (`?tab=`): Employee (`/employee/dashboard`), Project Manager
  (`/project-manager/dashboard`) use shared widgets (`components/dashboard/widgets.tsx`:
  `StatCard`, `SectionHeader`, `EmptyState`, `DashboardTabs`).
- Portals (talent/client/editor) use `PortalNavbar` + server components with `auth()` + `serverFetchAPI`.
- Per-user pages are `export const dynamic = 'force-dynamic'` (cookies/auth → no static prerender).

## 7. Database schema overview (`prisma/schema.prisma`)
Core models: `User` (role, isActive, mfa*), `TalentProfile` (+ `PortfolioMedia`,
`TalentPricing`, `TalentAvailability`, `SocialLink`, `UserTalent/Skill/Language`),
`Booking`, `HireRequest`, `CastingCall`/`CastingApplication`, `Project` (+ `Milestone`,
`ProjectVersion`, `Comment`, `Payment`), CMS content (`PortfolioItem`, `BlogPost`,
`Testimonial`, `TeamMember`, `Service`, `FaqItem`, `Announcement`, `Course`,
`MediaAsset`), `SystemConfig`, `FeatureFlag`, `AuditLog`, sales (`SalesLead`,
`SalesTarget`, `Referral`), `Employee` (+ attendance/leave/expense). Key enums:
`Role`, `TalentProfileStatus`, `HireRequestStatus`, `BookingStatus`, `ProjectStatus`,
`BlogPostStatus`, `MediaType`, `SocialPlatform`.

## 8. File upload flow
- **Client → Supabase Storage** directly via `lib/upload.ts` `uploadToSupabase({ file, bucket, folder })`
  → returns a permanent public URL. Used by talent onboarding/edit, editor version upload
  (`mp-private`), CMS media library (`mp-cms`), comment attachments.
- **API upload:** `POST /files/upload` (multipart ≤250 MB) → storage → `MediaAsset` record.
- Talent onboarding/edit upload all `File` objects to permanent URLs **before** submit
  (never persists `blob:` URLs); the backend stores avatar on `User.avatarUrl` and gallery
  as `PortfolioMedia` (`PORTFOLIO_IMAGE`).

## 9. E2E testing setup
- Playwright suite at `e2e/` + root `playwright.config.ts`. Projects: `setup` (per-role login →
  storage state) → `chromium`. 137 tests across 12 specs; covers login/logout, route protection
  (8-role matrix), dashboards, CRUD, uploads, forms, profile, search/pagination, CMS, errors.
- Parallel-safe: role auth cached as storage state; test data is worker-namespaced.
- Run: `pnpm e2e:install` → configure `e2e/.env.e2e` (seeded staging creds + `E2E_BASE_URL`) → `pnpm e2e`.
- See `e2e/README.md`.

## 10. Deployment process
See `docs/DEPLOYMENT_CHECKLIST.md`. Summary: install → `prisma migrate deploy` → build api & web →
deploy API container (`node dist/main`) + web (Vercel/`next start`). Rollback = redeploy previous
build + restore DB snapshot.
