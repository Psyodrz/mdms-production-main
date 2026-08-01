# MP Production (MDMS) — Production Handover Report

## 1. Features implemented / hardened this engagement
- **Talent onboarding & profile:** real media upload (permanent URLs, no `blob:`),
  avatar persisted to `User.avatarUrl`, gallery persisted as `PortfolioMedia`, Step-2
  validation UX fix, edit no longer forces re-review.
- **Hire requests:** talent Accept/Decline/In-Discussion — new `PATCH /talent/hire-requests/:id`
  (ownership-checked) + wired dashboard UI.
- **Role dashboards:** new EMPLOYEE (`/employee/dashboard`) and PROJECT_MANAGER
  (`/project-manager/dashboard`) dashboards reusing `DashboardLayout` + role `Sidebar` + shared
  widgets. EMPLOYEE wired to attendance/leave/expense; PM wired to `/admin/projects` (+ status updates).
- **CMS:** Courses module BFF routes added; Media module list + delete fixed; pagination end-to-end;
  publish/approve toggles send valid DTO payloads; duplicate `courses` config removed;
  navbar/`navigation` config key unified.
- **Admin:** audit logs accessible to ADMIN; settings Business Hours + Blocked Dates editors
  (config-store backed); feature-flag CRUD via authenticated client.
- **E2E:** full Playwright suite (fixtures, page objects, test data, 8-role matrix, 137 tests).

## 2. Bugs fixed (from QA report)
| # | Bug | Fix |
|---|---|---|
| S1 | BFF fabricated success on failed writes | All CMS write routes + `backendFetch` return real errors/status |
| S2 | `serverFetchAPI` `.ok` misuse → always-empty lists | editor-portal, editor upload, client casting read envelope |
| S3 | Publish/approve toggles sent partial payloads → 400 | Toggle payload rebuilt from configured fields |
| S4 | Auth-fragile `localStorage` fetches → intermittent 401 | admin employees/settings/audit-logs routed via `fetchAPI` |
| S5 | Uploaded media never persisted (`File`→`{}`, `blob:`) | Upload before submit + backend avatar/gallery persistence |
| — | `AddProjectButton` invalid payload/auth | Correct DTO payload + `fetchAPI` + real errors |
| — | Onboarding Step-2 dead-end | Scrolls to blocking field / clear messaging |
| — | Failing `admin.service` unit test | Missing `SupabaseAdminService` provider added |
| — | creator-lab crash (missing imports) | Imports added |
| — | services `₹NaN` pricing | Corrected paise handling |
| — | EMPLOYEE/PM post-login 404 | Real dashboards + redirects |
| — | Courses/Media CMS broken | Routes + config fixed |
| — | Course lessons + students routes faked success | Real error propagation |
| — | Dead `register-talent-dynamic` route | Removed |
| — | Debug `console.log`s (nextauth stub, api bootstrap) | Removed / converted to Nest `Logger` |

All fixes verified by: `api build`, `api typecheck`, `api test` (10/10), `web build` (105/105 pages),
Playwright `--list` (137 tests collected).

## 3. Remaining known limitations
1. **OTP delivery not wired** — `auth.service.ts` stores OTP in Redis but the send step is a
   documented `TODO` (email/WhatsApp). OTP login is non-functional until an SMTP/WhatsApp sender is added.
   *(Comment intentionally retained — it flags a real gap; deleting it would hide the limitation.)*
2. **Checkout payment is simulated** — manual-UTR/client-side unlock, no live gateway (intentional
   per project constraints). Course access is not payment-verified server-side.
3. **Intentional auth posture (per constraints, left unchanged):** hardcoded SUPER_ADMIN/ADMIN
   fallbacks, CMS service-account credentials, `guard.ts` dev-mode SUPER_ADMIN bypass, open
   registration role field. These must be locked down before a true public production launch.
4. **Business Hours / Blocked Dates duplication** — the admin-settings editors persist to the
   SystemConfig store (ADMIN-accessible), while the API also exposes `/system/working-hours` and
   `/system/blocked-dates` (SUPER_ADMIN-only, currently unused by the UI). Two stores exist for the
   same concept; consolidate when the booking engine consumes them. *(Not a defect — both persist.)*
5. **Duplicate/legacy routes** retained (functional, low-risk): camelCase vs kebab CMS pages
   (`castingCalls`/`casting-calls`, `featureFlags`/`feature-flags`), `hq-admin`/`hq-super-admin`
   login pages, mock `(protected)/*/dashboard` pages (unreferenced by nav).
6. **Backend unit-test coverage ~7%** (services/controllers only). E2E suite compensates at the
   flow level but cannot run here.
7. **Some sections are honest empty states** (EMPLOYEE tasks/documents/notifications; PM
   task-board/team/talent/deliverables/notifications) — no backend subsystem exists yet; they
   render real empty states, not mock data.

## 4. Required infrastructure
PostgreSQL 14+, Redis 6+, Supabase (auth + storage buckets `mp-public`, `mp-private`, `mp-cms`,
`mdms`), SMTP provider, Cloudinary/S3 for media, Node 20+. See `docs/DEPLOYMENT_CHECKLIST.md`.

## 5. Deployment prerequisites
- All secrets set in the target environment (no hardcoded fallbacks in effect).
- `prisma migrate deploy` applied; DB seeded with the 8 role accounts for staging/E2E.
- Supabase OAuth providers + storage buckets + RLS configured.
- DB trigger mirroring Supabase Auth users → Prisma `User` verified.
- Pre-deploy gate green (api build/typecheck/test, web build).

## 6. Post-deployment validation checklist
- [ ] `GET /api/v1/health` returns 200.
- [ ] Login works for each of the 8 roles; each lands on the correct dashboard.
- [ ] Guest hitting `/admin`, `/super-admin`, portals → redirected to `/login`.
- [ ] SUPER_ADMIN CMS: create → reload persists → delete → recycle bin restore.
- [ ] Media upload returns an `https` URL (never `blob:`); asset appears in Media.
- [ ] Talent onboarding submit persists avatar + gallery after reload.
- [ ] PM `/admin/projects` list loads; status update persists.
- [ ] Employee attendance check-in/out records persist.
- [ ] Contact form + talent hire request submit successfully.
- [ ] 404 page renders for unknown routes (no runtime crash).
- [ ] Run `pnpm e2e` against production-like staging → green.

## 7. Maintenance recommendations
1. **Lock down intentional dev shortcuts** before public launch (items 3 above).
2. **Wire OTP delivery** (SMTP/WhatsApp) or disable the OTP path.
3. **Implement real payment verification** if paid courses go live.
4. **Raise backend test coverage** toward the flow-critical services (auth, cms, talent, admin).
5. **Consolidate Business Hours / Blocked Dates** onto one store when the booking engine uses them.
6. **Remove legacy duplicate routes** once confirmed unused with stakeholders.
7. **Rotate** the Supabase keys/service-account password that currently have code fallbacks.
8. **Add CI** running the pre-deploy gate + Playwright against an ephemeral seeded DB.

## 8. Production-ready verdict
**Not yet production-ready for a public launch**, pending: (a) execution of the E2E suite + manual
smoke test against seeded staging (blocked in the dev sandbox — no staging DB/browsers), and
(b) closing the intentional security shortcuts (item 3) if the deployment is public-facing.

**Code-level status is green:** API build ✅, API typecheck ✅, API tests 10/10 ✅, web build
(105/105 pages) ✅, Playwright suite valid (137 tests) ✅. Functional defects from the QA report
are resolved and build-verified. The remaining gates are environmental (staging execution) and
policy (security posture), both documented above.
