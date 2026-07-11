# MDMS Codebase Map & File Roles

This document provides a comprehensive mapping of the **MDMS (Media & Digital Management System)** codebase. It outlines the role of every directory, configuration file, backend NestJS module, frontend Next.js App Router structure, shared packages, and database configuration.

---

## 1. Monorepo Root Configurations

These files govern the Turborepo workspace, package manager, and development environment.

- [`package.json`](file:///d:/JCRM/MP%20Production/package.json): Root project configuration defining the pnpm workspaces and monorepo scripts.
- [`pnpm-workspace.yaml`](file:///d:/JCRM/MP%20Production/pnpm-workspace.yaml): Registers packages in `/apps` and `/packages` directories for pnpm.
- [`turbo.json`](file:///d:/JCRM/MP%20Production/turbo.json): Directs compilation caching and pipelines tasks like `build`, `lint`, and `dev` across the packages.
- [`.env`](file:///d:/JCRM/MP%20Production/.env): Environment variables containing local URLs, ports, database credentials, and SMTP configuration.
- [`.env.example`](file:///d:/JCRM/MP%20Production/.env.example): Blueprint environment template showing required variables (secrets omitted).
- [`docker-compose.yml`](file:///d:/JCRM/MP%20Production/docker-compose.yml): Spins up local supporting services (PostgreSQL database, Redis cache) for development.
- [`docker-compose.prod.yml`](file:///d:/JCRM/MP%20Production/docker-compose.prod.yml): Production Docker-Compose configuration.
- [`render.yaml`](file:///d:/JCRM/MP%20Production/render.yaml): Render deployment configuration blueprint.
- [`AGENTS.md`](file:///d:/JCRM/MP%20Production/AGENTS.md) / [`PRODUCTION_AGENTS.md`](file:///d:/JCRM/MP%20Production/PRODUCTION_AGENTS.md): Strict security, build, validation, and design system instructions for AI coding assistants.

---

## 2. Shared Packages (`/packages`)

Shared modules imported across both NestJS (backend) and Next.js (frontend) to maintain type safety and design consistency.

### `packages/types`
- [`package.json`](file:///d:/JCRM/MP%20Production/packages/types/package.json): Packaging config for shared types.
- [`tsconfig.json`](file:///d:/JCRM/MP%20Production/packages/types/tsconfig.json): TypeScript target options for compiling types.
- [`src/index.ts`](file:///d:/JCRM/MP%20Production/packages/types/src/index.ts): Declares shared types, models, database helper interfaces, and the primary `Role` enum (e.g., `SUPER_ADMIN`, `TALENT`, `CLIENT`, etc.).
- [`src/permissions.ts`](file:///d:/JCRM/MP%20Production/packages/types/src/permissions.ts): Maps granular action permissions (e.g. `MANAGE_BLOG`, `VIEW_AUDIT_LOGS`, `RESET_MFA`) assigned to roles.

### `packages/design-tokens`
- [`package.json`](file:///d:/JCRM/MP%20Production/packages/design-tokens/package.json): Packaging config for design tokens.
- [`css/tokens.css`](file:///d:/JCRM/MP%20Production/packages/design-tokens/css/tokens.css): Defines standard design tokens as CSS custom properties (colors, typography scales, shadows, glassmorphic filters) matching the brand requirements (Warm Ivory Light Theme, Midnight Navy Dark Theme).

### `packages/config`
- Contains common shareable compiler settings like standard TSConfig extensions used by apps and packages.

---

## 3. Database Layer (`/prisma`)

This folder handles all database schemas, seed datasets, and migration commands.

- [`prisma/schema.prisma`](file:///d:/JCRM/MP%20Production/prisma/schema.prisma): Single source of truth database schema. Defines models for `User`, `Profile`, `Project`, `ProjectAssignment`, `AuditLog`, `Testimonial`, `BlogPost`, `TeamMember`, `RecycleBin`, and `SystemConfig`.
- [`prisma/seed.ts`](file:///d:/JCRM/MP%20Production/prisma/seed.ts): Seeding script populated with dummy administrative data, talent records, blog posts, and site configurations to populate a fresh database.
- [`prisma/fix-superadmin.sql`](file:///d:/JCRM/MP%20Production/prisma/fix-superadmin.sql) / [`prisma/verify-users.sql`](file:///d:/JCRM/MP%20Production/prisma/verify-users.sql): Utility script helpers for testing user role promotions directly inside PostgreSQL.
- [`prisma/supabase-trigger.sql`](file:///d:/JCRM/MP%20Production/prisma/supabase-trigger.sql): Database level triggers that automatically synchronize Supabase Auth credentials with MDMS users.

---

## 4. Backend Application (`/apps/api`)

The NestJS backend application providing structured REST endpoints, token auth, caching, and role-based guards.

### Entry & Core Setup
- [`src/main.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/main.ts): App bootstrapper. Instantiates NestJS, registers global Pipes (`ValidationPipe` for DTOs), sets prefix to `/api/v1`, and connects request validation filters.
- [`src/app.module.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/app.module.ts): The root module that pulls together NestJS modules and registers security guards (`JwtAuthGuard` and `RolesGuard`) globally.

### Common Layer (`/apps/api/src/common`)
- [`common/guards/jwt-auth.guard.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/common/guards/jwt-auth.guard.ts): Extracts JWT tokens from request headers and verifies them. Respects the `@Public()` decorator.
- [`common/guards/roles.guard.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/common/guards/roles.guard.ts): Checks the verified actor's role against permissions requested on controllers with the `@Roles()` decorator.
- [`common/decorators/roles.decorator.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/common/decorators/roles.decorator.ts): Declares custom metadata decorators (`@Roles()` and `@Public()`).
- [`common/decorators/current-user.decorator.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/common/decorators/current-user.decorator.ts): Injector to fetch decoded user payload inside controller arguments.
- [`common/constants/role-permissions.map.ts`](file:///d:/JCRM/MP%20Production/apps/api/src/common/constants/role-permissions.map.ts): Declares the mapping configuration of role permissions.

### Core Modules (`/apps/api/src/`)

Each module below contains specific controller classes (routing rules), services (database queries & mutations), and validation data transfer objects (DTOs):

1. **`prisma`**: Contains `PrismaService` which exposes the Prisma client instance to NestJS.
2. **`redis`**: Exposes `RedisService` to interact with Redis for temporary tokens and rate limiting.
3. **`auth`**: Handles OAuth parsing, token creation, password checks, two-factor OTP flows, and custom user session authentication.
4. **`users`**: Provides CRUD endpoints for managing basic user accounts.
5. **`admin`**: Gates platform-wide operations (RBAC updates, user deactivations, MFA resets, global logs).
6. **`audit`**: Asynchronously records system events to the database audit trail.
7. **`cms`**: Manages all public content databases (Blog, Portfolio items, Testimonials, FAQs, Announcements, Team directory) along with a global site variables configuration endpoint.
8. **`editor`**: Gates endpoints for editors to manage projects, upload clips, and verify project deliverables.
9. **`employee`**: Operations specific to internal staff schedules and tasks.
10. **`talent` / `talent-category`**: Handles talent registrations, category classifications, and profiles.
11. **`booking` / `bookings`**: Controls booking dates, invoices, status schedules, and client reservations.
12. **`file`**: Upload handler managing cloud integrations (Cloudinary/S3).
13. **`payments`**: Integration endpoints for payment processors.
14. **`whatsapp`**: Whatsapp webhook integrations.
15. **`notifications`**: Dispatches system emails and alerts.
16. **`system`**: Platform status reports, diagnostics, and environment verification.

---

## 5. Frontend Application (`/apps/web`)

The Next.js 15 App Router web application containing public pages, dashboard portals, and interactive component libraries.

### Configuration & Bootstrap
- [`next.config.ts`](file:///d:/JCRM/MP%20Production/apps/web/next.config.ts): Next.js build-time variables, route rewrites, and asset domains.
- [`tailwind.config.ts`](file:///d:/JCRM/MP%20Production/apps/web/tailwind.config.ts): Tailwind config mapping theme states to the global design token variables.
- [`package.json`](file:///d:/JCRM/MP%20Production/apps/web/package.json): Frontend dependencies (`lucide-react`, `framer-motion`, `gsap`, `@supabase/ssr`, `next-themes`).

### App Core files (`apps/web/src`)
- [`src/auth.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/auth.ts): Custom async server wrapper that checks cookies and parses Supabase session details to replicate NextAuth sessions.
- [`src/middleware.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/middleware.ts): Gatekeeper validating role-based authorization scopes (`ROLE_ROUTES`) before allowing access to internal paths.
- [`src/global.d.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/global.d.ts): TypeScript type overrides.

### Pages & Routing Structure (`apps/web/src/app`)

#### Public Cinematic Pages
- [`app/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/page.tsx): Premium landing homepage featuring GSAP animations and product showcase grids.
- [`app/about/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/about/page.tsx): Cinematic profile of MP Production's history.
- [`app/portfolio/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/portfolio/page.tsx): Grid gallery showcasing production clips.
- [`app/portfolio/[slug]/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/portfolio/%5Bslug%5D/page.tsx): Deep-dive project description with multimedia embeds.
- [`app/talent/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/talent/page.tsx): Public index directory of signed talent.
- [`app/talent/[id]/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/talent/%5Bid%5D/page.tsx): Talent profiles containing showreels, media galleries, and bio cards.
- [`app/team/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/team/page.tsx): Highlights staff, directors, and core leadership.
- [`app/testimonials/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/testimonials/page.tsx): Carousel displaying client feedback and project highlights.
- [`app/faq/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/faq/page.tsx): Accordion-based FAQs.
- [`app/services/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/services/page.tsx): Standard service listings.
- [`app/contact/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/contact/page.tsx): Interactive query form mapping contact requests.
- [`app/careers/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/careers/page.tsx): Job board listing open roles.

#### Authentication Routing
- [`app/(auth)/login/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/(auth)/login/page.tsx): Secure login page wrapper.
- [`app/(auth)/register/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/(auth)/register/page.tsx): General registration endpoint.
- [`app/join/talent/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/join/talent/page.tsx): Specialized onboard wizard for talent registration.
- [`app/hq-admin/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/hq-admin/page.tsx) / [`app/hq-super-admin/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/hq-super-admin/page.tsx): Supabase bypass login panels specifically for admins.

#### Protected Portals (`app/(protected)`)
- **`super-admin/`**: High-level panel for database recovery, RBAC management, audits, and configuration controls.
  - [`super-admin/users/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/(protected)/super-admin/users/page.tsx): Security control dashboard.
  - [`super-admin/cms/page.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/app/(protected)/super-admin/cms/page.tsx): Portal to override blog posts, testimonials, and portfolios.
- **`admin/`**: Standard administrative workspace.
- **`client-portal/`**: Client interface to inspect assignments, track deliverables, and make media reviews.
- **`talent-dashboard/`**: Talent portal to configure portfolios, upload showreels, and check pending bookings.
- **`editor-portal/`**: Video editor interface to update video timelines and review feedback logs.

#### API Integrations (`app/api`)
- Mock routes, media upload endpoints, and verification services:
  - [`app/api/auth/[...nextauth]/route.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/app/api/auth/%5B...nextauth%5D/route.ts): Dummy handler endpoint maintaining API structure.
  - [`app/api/talent/media/route.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/app/api/talent/media/route.ts): API route that receives raw client uploads and pushes them to Supabase storage.

### Common Components & Libraries (`apps/web/src/components`)

- [`components/AuthForm.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/AuthForm.tsx): The main unified login and signup interface.
- [`components/DashboardLayout.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/DashboardLayout.tsx): Shared navigation shell for internal portals.
- [`components/Sidebar.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/Sidebar.tsx): Dynamic collapsible side-nav.
- [`components/theme-provider.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/theme-provider.tsx): Standard theme injector (`next-themes`).
- [`components/theme-toggle.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/theme-toggle.tsx): Button interface switching the site between light, dark, and system themes.

#### Motion Animations Component Library (`components/motion`)
- [`components/motion/DecryptedText.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/motion/DecryptedText.tsx): Decrypting letter-shuffling text animation.
- [`components/motion/FlowingMenu.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/motion/FlowingMenu.tsx): Interactive menu hover effects showing repeating images.
- [`components/motion/Reveal.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/motion/Reveal.tsx): Scrolling viewport fade-ins.
- [`components/motion/PageTransitionWrapper.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/motion/PageTransitionWrapper.tsx): Smooth page transition wrapping frame.

#### UI Components (`components/ui`)
- [`components/ui/Navbar.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/ui/Navbar.tsx): Main site public header.
- [`components/ui/3d-interactive-navbar.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/ui/3d-interactive-navbar.tsx): Glassmorphic cinematic navigation controller.
- [`components/ui/PortalNavbar.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/ui/PortalNavbar.tsx): Internal header badge command center nav.
- [`components/ui/hover-footer.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/ui/hover-footer.tsx): Cinematic dark theme-proof footer with hover effects.
- [`components/ui/Container.tsx`](file:///d:/JCRM/MP%20Production/apps/web/src/components/ui/Container.tsx): Standard layout width-wrapper.

### Application Utilities & Hooks (`apps/web/src/utils`, `apps/web/src/hooks`, `apps/web/src/lib`)
- [`utils/supabase/client.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/utils/supabase/client.ts): Client-side Supabase credentials wrapper with Next.js build-time safety.
- [`utils/supabase/server.ts`](file:///d:/JCRM/MP%20Production/apps/web/src/utils/supabase/server.ts): Server-side Supabase Client configured to await cookies for session retrieval.
