# MP Production — Deployment Checklist

Monorepo (Turborepo + pnpm): `apps/api` (NestJS), `apps/web` (Next.js 15/16),
`packages/types`, `packages/config`, `packages/design-tokens`.

---

## 1. Environment variables

### API (`apps/api`) — read via `@nestjs/config` (see `apps/api/.env.example`)
| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` / `JWT_ACCESS_SECRET` | ✅ | JWT signing. App refuses to start without a secret. |
| `DATABASE_URL` | ✅ | PostgreSQL connection (Prisma). |
| `REDIS_URL` | ✅ | Redis (OTP store, caching). |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase admin (JWT verification, role sync). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | ⚠️ | Email/OTP delivery (see Known Limitation: OTP send not yet wired). |
| `CLOUDINARY_*` or S3 (`AWS_*`) | ⚠️ | Media uploads (`/files/upload`). |
| `PORT` | optional | API port (default 3001). |

### Web (`apps/web`) — confirmed references in source
| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the NestJS API (`.../api/v1`). |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (client auth). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (client auth). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only: student enrollments + talent media upload (`utils/supabase/admin`, `api/talent/media`). |
| `SUPABASE_PROJECT_ID` | ✅ | Used to build the storage URL in `api/talent/media`. |
| `NEXTAUTH_SECRET` | ✅ | Middleware `getToken` + BFF session (`guard.ts`). |
| `CMS_SERVICE_EMAIL` / `CMS_SERVICE_PASSWORD` | ✅ | CMS BFF service account (intentional design). |
| `CMS_API_URL` / `API_INTERNAL_URL` | optional | Internal API URL override for the BFF. |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Canonical site URL (sitemap/robots). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | optional | WhatsApp widget default number. |

> ⚠️ Several web files ship hardcoded Supabase URL/anon-key and CMS service-account
> fallbacks. These are intentional per project constraints but **must** be overridden
> by real environment values in production.

---

## 2. Database (PostgreSQL)
- Provision PostgreSQL 14+ and set `DATABASE_URL`.
- Apply schema: `pnpm --filter api prisma migrate deploy` (prod) — schema at `prisma/schema.prisma`.
- Generate client: `pnpm db:generate`.
- Seed (staging/e2e): `pnpm db:seed` — must create the 8 role accounts.

## 3. Redis
- Provision Redis 6+ and set `REDIS_URL`.
- Used for OTP storage (5-min TTL) and caching. No manual schema.

## 4. Supabase
- Create a Supabase project; set `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` / `SERVICE_ROLE_KEY`.
- Auth: email/password enabled; Google & Apple OAuth providers configured with redirect `/(auth)/callback`.
- The NestJS API validates Supabase JWTs; ensure the JWT secret/JWKS is aligned.
- A DB trigger is expected to mirror Supabase Auth users into the Prisma `User` table (verify it exists).

## 5. Storage buckets (Supabase Storage)
Confirmed bucket names referenced in code (`lib/upload.ts`, `api/talent/media`):
- `mp-public` — talent avatars, covers, gallery, CMS public media.
- `mp-private` — editor version uploads, client comment attachments.
- `mp-cms` — CMS media fallback.
- `mdms` — talent media route (`api/talent/media`).
Create all four with appropriate RLS/service-role policies.

## 6. Required secrets (store in the platform secret manager — never in code)
`AUTH_SECRET`, `DATABASE_URL`, `REDIS_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXTAUTH_SECRET`, `CMS_SERVICE_PASSWORD`, SMTP creds, Cloudinary/S3 keys.

## 7. Third-party services
- **Supabase** (auth + storage) — required.
- **PostgreSQL** + **Redis** — required.
- **SMTP provider** (SES/Nodemailer) — required for OTP/email (delivery not yet wired — see handover).
- **Cloudinary or S3** — media uploads.
- **WhatsApp / InboxWA** — optional messaging integration.
- **Razorpay/UPI** — NOTE: checkout payment is currently a simulated/manual-UTR flow (intentional per constraints); no live gateway is wired.

## 8. Build commands
```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter api build      # nest build
pnpm --filter web build      # next build
# or: pnpm build (turbo run build)
```

## 9. Deployment commands
- **API** (`apps/api/Dockerfile` present): container → `node dist/main` (`pnpm --filter api start:prod`).
- **Web** (Vercel config present: `.vercel/`, `vercel.json`): `next build` → `next start`, or Vercel deploy via `.github/workflows/deploy.yml`.
- Run migrations before starting the API: `pnpm --filter api prisma migrate deploy`.

## 10. Rollback steps
1. **App:** redeploy the previous image/build tag (Vercel: promote prior deployment; container: redeploy previous tag).
2. **Database:** restore from the pre-deploy snapshot. Prisma migrations are additive — if a migration must be reverted, restore the snapshot rather than down-migrating in production.
3. **Config:** revert env/secret changes in the secret manager.
4. **Verify:** run the Post-Deployment Validation Checklist (see Handover Report §6).

---

## Pre-deploy gate (must all pass)
- [ ] `pnpm --filter api build` ✅
- [ ] `pnpm --filter api typecheck` ✅
- [ ] `pnpm --filter api test` ✅ (10/10)
- [ ] `pnpm --filter web build` ✅ (105/105 pages)
- [ ] `pnpm e2e` against seeded staging ✅ (requires staging env — see e2e/README.md)
- [ ] All secrets set in the target environment (no hardcoded fallbacks in effect)
- [ ] Prisma migrations applied
- [ ] Supabase buckets + OAuth providers configured
