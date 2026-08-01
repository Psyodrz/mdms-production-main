# MP Production — End-to-End Test Suite (Playwright)

Full user-flow coverage across all 8 roles (GUEST, CLIENT, TALENT, EDITOR,
EMPLOYEE, PROJECT_MANAGER, ADMIN, SUPER_ADMIN). No mocked UI — tests run against
a real, seeded staging database.

## Layout

```
playwright.config.ts        # root config (projects: setup → chromium)
e2e/
  .env.e2e.example          # copy to .env.e2e with seeded staging creds
  support/
    roles.ts                # role → route matrix + credential resolution
    auth.setup.ts           # logs in each seeded role, saves storage state
    fixtures.ts             # page-object fixtures + describeAsRole()
    test-data.ts            # worker-unique data factories (parallel-safe)
  pages/                    # page objects (Login, Dashboard, CmsResource, …)
  fixtures/sample.png       # upload fixture
  tests/                    # specs by area
```

## Coverage

| Area | Spec |
|------|------|
| Login / Logout / invalid creds | `auth.spec.ts` |
| Route protection (8-role matrix + guest) | `route-protection.spec.ts` |
| Dashboard loading (every role + every tab) | `dashboards.spec.ts` |
| Public pages & navigation | `public.spec.ts`, `navigation.spec.ts` |
| CMS modules load | `cms.spec.ts` |
| CRUD (create/persist/delete) | `cms-crud.spec.ts` |
| Search & pagination | `cms.spec.ts` |
| Uploads (real file → permanent URL) | `uploads.spec.ts` |
| Forms (contact, booking) | `forms.spec.ts` |
| Profile update | `profile.spec.ts` |
| Role permissions | `route-protection.spec.ts` |
| Error handling (404, invalid, unknown resource) | `error-handling.spec.ts` |

## Setup

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
cp e2e/.env.e2e.example e2e/.env.e2e   # fill with seeded staging creds
```

## Seed the staging database

Provision the 8 role accounts in staging (Supabase Auth + Prisma user rows),
then put their emails/passwords in `e2e/.env.e2e`. Any role left blank is
skipped automatically, so partial credential sets still run green.

## Run

```bash
pnpm e2e            # headless, all specs
pnpm e2e:ui         # interactive UI mode
pnpm e2e:report     # open the last HTML report
```

By default tests target `E2E_BASE_URL`. Set `E2E_WEBSERVER=1` to have Playwright
boot a local production server instead.

## Parallel safety

- Auth runs once per role in the `setup` project; specs reuse the saved storage
  state (read-only).
- All created data is namespaced per worker (`test-data.ts`), so concurrent
  workers never collide.
- Specs never depend on each other's ordering.
