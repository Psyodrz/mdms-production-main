# MDMS — AI Agent Fix & Build Instructions

> **For the executing agent:** Read this entire file before writing a single line of code.
> Execute phases in strict order. Never skip a phase. Never partially complete a task and move on.
> After each task, run the listed verification check before proceeding.

---

## Project Context

This is **MDMS** (Media & Digital Management System) — a Turborepo monorepo.

```
apps/
  api/          NestJS backend — global prefix api/v1, Prisma + PostgreSQL, Redis
  web/          Next.js 15 App Router + NextAuth
packages/
  types/        @mdms/types — shared enums (Role, etc.)
  config/       shared tsconfig
  design-tokens/
```

**Stack facts the agent must know:**
- Backend guards: `JwtAuthGuard` → `RolesGuard`. The `Role` enum values are `UPPERCASE`: `GUEST`, `CLIENT`, `TALENT`, `EDITOR`, `EMPLOYEE`, `PROJECT_MANAGER`, `ADMIN`, `SUPER_ADMIN`.
- Frontend auth: NextAuth. Session carries `user.role` as a string from the JWT.
- Shared types live in `packages/types/src/` and are imported as `@mdms/types`.
- Prisma client is at `apps/api/src/prisma/prisma.service.ts`.
- All backend DTOs use `class-validator` decorators.
- The frontend uses the App Router (`app/` directory, `page.tsx`, `layout.tsx`, server components by default).

---

## Agent Rules — Non-Negotiable

1. **Execute phases in order: 0 → 1 → 2 → 3 → 4.** Do not start Phase 1 until all Phase 0 tasks pass verification.
2. **Never delete existing functionality.** Fix, extend, or replace with equivalent or better.
3. **Every new backend endpoint must have `@Roles()` or `@Public()`.** No undecorated handlers.
4. **Every new DTO must use `class-validator`.** No `any` types on request bodies.
5. **Every new Prisma model change requires a migration.** Run `pnpm prisma migrate dev --name <descriptive-name>` after schema edits.
6. **Import `Role` from `@mdms/types`**, not redefined locally.
7. **No hardcoded secrets, tokens, or credentials** anywhere in code.
8. **Write TypeScript strictly.** No implicit `any`. Enable `strict: true` checks.
9. **After every file change, check that the affected app still compiles** (`pnpm --filter api build` or `pnpm --filter web build`).
10. **Log nothing sensitive.** No passwords, OTPs, tokens, or PII in `logger.log()` or `console.log()`.

---

## Phase 0 — Critical Security Fixes

> **These are blocking bugs. Ship nothing else until Phase 0 is complete.**
> Estimated time: 3–4 hours total.

---

### Task 0.1 — Fix role casing mismatch in Next.js middleware

**Problem:** `apps/web/middleware.ts` compares roles against lowercase strings (`'super_admin'`, `'admin'`) but the JWT and NextAuth session carry uppercase enum values (`'SUPER_ADMIN'`, `'ADMIN'`). Every role check silently fails.

**File to edit:** `apps/web/middleware.ts`

**What to do:**

Find the section that reads the role from the session and compares it. It will look something like:

```typescript
// BROKEN — what exists now (approximately)
const role = token?.role;
if (pathname.startsWith('/super-admin') && role !== 'super_admin') {
  return NextResponse.redirect(...)
}
```

Replace the entire role comparison logic with this pattern:

```typescript
// FIXED
import { Role } from '@mdms/types';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const ROLE_ROUTES: Record<string, Role[]> = {
  '/super-admin':     [Role.SUPER_ADMIN],
  '/admin':           [Role.ADMIN, Role.SUPER_ADMIN],
  '/client-portal':   [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/talent-dashboard':[Role.TALENT, Role.ADMIN, Role.SUPER_ADMIN],
  '/editor-portal':   [Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN],
  '/employee-portal': [Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN],
  '/project-manager': [Role.PROJECT_MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Not authenticated — redirect to login for any protected route
  const isProtected = Object.keys(ROLE_ROUTES).some(p => pathname.startsWith(p));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Authenticated — check role
  if (isProtected && token) {
    const userRole = token.role as Role; // Role is already uppercase from backend
    const matchedPrefix = Object.keys(ROLE_ROUTES).find(p => pathname.startsWith(p));
    if (matchedPrefix) {
      const allowed = ROLE_ROUTES[matchedPrefix];
      if (!allowed.includes(userRole)) {
        return NextResponse.redirect(new URL(getDashboardUrl(userRole), req.url));
      }
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:    return '/super-admin';
    case Role.ADMIN:          return '/admin';
    case Role.CLIENT:         return '/client-portal';
    case Role.TALENT:         return '/talent-dashboard';
    case Role.EDITOR:         return '/editor-portal';
    case Role.EMPLOYEE:       return '/employee-portal';
    case Role.PROJECT_MANAGER:return '/project-manager';
    default:                  return '/';
  }
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/client-portal/:path*',
    '/talent-dashboard/:path*',
    '/editor-portal/:path*',
    '/employee-portal/:path*',
    '/project-manager/:path*',
  ],
};
```

**Verification:**
- `pnpm --filter web build` — must compile with no errors.
- Log in as a CLIENT user and manually confirm you cannot access `/super-admin` (you get redirected).
- Log in as a SUPER_ADMIN and confirm you can access `/super-admin`.

---

### Task 0.2 — Register guards globally in app.module.ts

**Problem:** `JwtAuthGuard` and `RolesGuard` are applied per-controller via `@UseGuards()`. A controller that forgets this decorator is completely unprotected.

**File to edit:** `apps/api/src/app.module.ts`

**What to do:**

Add global guard providers. Find the `providers` array and add:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  // ...existing imports...
  providers: [
    // ... existing providers ...
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

**Then remove** `@UseGuards(JwtAuthGuard, RolesGuard)` from every controller that has it — they are now redundant. Keep `@Roles(...)` and `@Public()` decorators — those are still needed.

**Verify that `@Public()` still works:**

Check `apps/api/src/common/guards/jwt-auth.guard.ts`. It must honour `@Public()`. If it doesn't already, add:

```typescript
import { IS_PUBLIC_KEY } from '../decorators/roles.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

**Verification:**
- `pnpm --filter api build` — must compile.
- `curl http://localhost:3001/api/v1/cms/portfolio` — must return data (public endpoint).
- `curl http://localhost:3001/api/v1/cms/admin/blog` — must return `401 Unauthorized` without a token.

---

### Task 0.3 — Fix super-admin bypass bug in editor.service.ts

**Problem:** `editor.service.ts` contains a check like `userId !== 'SUPER_ADMIN'` — comparing a UUID user ID against a role string. This always evaluates to `true`, so the bypass never fires.

**File to edit:** `apps/api/src/editor/editor.service.ts`

**What to do:**

Find the method `getProjectDetails` (or similar) containing this broken check. Replace:

```typescript
// BROKEN
if (userId !== 'SUPER_ADMIN') {
  // check project assignment
}
```

With:

```typescript
// FIXED — inject the full user object from the JWT payload
import { Role } from '@mdms/types';

// In the method signature, accept the user object:
async getProjectDetails(projectId: string, user: { id: string; role: Role }) {
  // Super admins can see any project
  if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
    return this.prisma.project.findUnique({ where: { id: projectId } });
  }

  // Editors can only see projects they are assigned to
  const assignment = await this.prisma.projectAssignment.findFirst({
    where: { projectId, userId: user.id },
  });
  if (!assignment) {
    throw new ForbiddenException('You are not assigned to this project.');
  }
  return this.prisma.project.findUnique({ where: { id: projectId } });
}
```

Update the corresponding controller method to pass `req.user` (the full JWT payload) instead of just `req.user.id`.

**Verification:**
- `pnpm --filter api build` — must compile.
- A SUPER_ADMIN JWT token must be able to call `GET /api/v1/editor/projects/:id` for any project.
- An EDITOR JWT must get `403` for projects they are not assigned to.

---

### Task 0.4 — Remove OTP console log and hardcoded AUTH_SECRET

**File to edit:** `apps/api/src/auth/auth.service.ts`

Find and remove any line resembling:

```typescript
this.logger.log(`OTP for ${email}: ${otp}`); // TODO: remove in production
```

Delete it entirely. OTPs must never be logged.

---

**File to edit:** `apps/api/src/auth/auth.config.ts`

Find:

```typescript
secret: process.env.AUTH_SECRET || 'some-hardcoded-fallback-secret',
```

Replace with:

```typescript
const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error('AUTH_SECRET environment variable is not set. Refusing to start.');
}
// then use `secret` in the config
```

---

**Create:** `apps/api/.env.example`

```env
# Required — generate with: openssl rand -base64 64
AUTH_SECRET=

# Required
DATABASE_URL=postgresql://user:password@localhost:5432/mdms
REDIS_URL=redis://localhost:6379

# Required for email OTP (nodemailer or similar)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Optional — Cloudinary for media uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Verification:**
- Start the API without `AUTH_SECRET` set — must throw an error and refuse to start.
- Start with `AUTH_SECRET` set — must boot normally.
- Trigger an OTP flow — confirm no OTP appears in server logs.

---

### ✅ Phase 0 Complete Checklist

Before moving to Phase 1, confirm ALL of the following:

- [ ] `pnpm --filter web build` passes
- [ ] `pnpm --filter api build` passes
- [ ] Role casing: a CLIENT session cannot access `/super-admin`
- [ ] All 7 portal routes are protected in middleware (including editor, employee, PM)
- [ ] `GET /api/v1/cms/admin/blog` returns 401 without token
- [ ] Super-admin bypass in editor.service uses role enum, not string comparison
- [ ] No OTP appears in server logs
- [ ] API refuses to start without `AUTH_SECRET`

---

## Phase 1 — RBAC Upgrade

> Only start Phase 1 after Phase 0 checklist is 100% complete.
> Estimated time: 8–12 hours.

---

### Task 1.1 — Add User Management API

**New file:** `apps/api/src/admin/dto/update-user-role.dto.ts`

```typescript
import { IsEnum } from 'class-validator';
import { Role } from '@mdms/types';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
```

**New file:** `apps/api/src/admin/dto/paginate-users.dto.ts`

```typescript
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@mdms/types';

export class PaginateUsersDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;
}
```

**Edit:** `apps/api/src/admin/admin.controller.ts`

Add these endpoints inside the existing `AdminController`, all gated with `@Roles(Role.ADMIN, Role.SUPER_ADMIN)`:

```typescript
@Get('users')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async listUsers(@Query() dto: PaginateUsersDto) {
  return this.adminService.listUsers(dto);
}

@Patch('users/:id/role')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async updateUserRole(
  @Param('id') id: string,
  @Body() dto: UpdateUserRoleDto,
  @CurrentUser() actor: JwtPayload,
) {
  return this.adminService.updateUserRole(id, dto.role, actor);
}

@Patch('users/:id/deactivate')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async deactivateUser(@Param('id') id: string, @CurrentUser() actor: JwtPayload) {
  return this.adminService.deactivateUser(id, actor);
}

@Patch('users/:id/reactivate')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async reactivateUser(@Param('id') id: string, @CurrentUser() actor: JwtPayload) {
  return this.adminService.reactivateUser(id, actor);
}

@Post('users/:id/reset-mfa')
@Roles(Role.SUPER_ADMIN)
async resetMfa(@Param('id') id: string, @CurrentUser() actor: JwtPayload) {
  return this.adminService.resetMfa(id, actor);
}
```

**Edit:** `apps/api/src/admin/admin.service.ts`

Implement the methods:

```typescript
async listUsers(dto: PaginateUsersDto) {
  const { page = 1, limit = 20, search, role } = dto;
  const where: Prisma.UserWhereInput = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name:  { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
  const [data, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count({ where }),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}

async updateUserRole(userId: string, newRole: Role, actor: JwtPayload) {
  // Guard: ADMIN cannot promote anyone to SUPER_ADMIN
  if (actor.role !== Role.SUPER_ADMIN && newRole === Role.SUPER_ADMIN) {
    throw new ForbiddenException('Only SUPER_ADMIN can assign the SUPER_ADMIN role.');
  }
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  await this.auditService.log({
    actorId: actor.sub,
    action: 'UPDATE_USER_ROLE',
    entityType: 'User',
    entityId: userId,
    meta: { newRole },
  });
  return user;
}

async deactivateUser(userId: string, actor: JwtPayload) {
  if (userId === actor.sub) throw new BadRequestException('Cannot deactivate your own account.');
  const user = await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  await this.auditService.log({ actorId: actor.sub, action: 'DEACTIVATE_USER', entityType: 'User', entityId: userId });
  return user;
}

async reactivateUser(userId: string, actor: JwtPayload) {
  const user = await this.prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  await this.auditService.log({ actorId: actor.sub, action: 'REACTIVATE_USER', entityType: 'User', entityId: userId });
  return user;
}

async resetMfa(userId: string, actor: JwtPayload) {
  const user = await this.prisma.user.update({ where: { id: userId }, data: { totpSecret: null, mfaEnabled: false } });
  await this.auditService.log({ actorId: actor.sub, action: 'RESET_MFA', entityType: 'User', entityId: userId });
  return { message: 'MFA reset successfully.' };
}
```

**Verification:**
- `GET /api/v1/admin/users` with ADMIN token → returns paginated user list.
- `PATCH /api/v1/admin/users/:id/role` with `{ "role": "SUPER_ADMIN" }` using ADMIN token → returns `403`.
- `PATCH /api/v1/admin/users/:id/role` with `{ "role": "SUPER_ADMIN" }` using SUPER_ADMIN token → succeeds.
- `PATCH /api/v1/admin/users/:id/deactivate` where `:id` is the actor's own ID → returns `400`.

---

### Task 1.2 — User Management Admin UI

**New file:** `apps/web/app/(protected)/admin/users/page.tsx`

This is a Next.js server component page that renders a `UserTable` client component. The page must:

1. Use `getServerSession` to verify the user is `ADMIN` or `SUPER_ADMIN` — redirect to `/admin` if not.
2. Pass the session's role to the `UserTable` so it knows whether to show the "Reset MFA" button (SUPER_ADMIN only) and whether role elevations to SUPER_ADMIN are allowed.

**New client component:** `apps/web/components/admin/UserTable.tsx`

Requirements:
- Fetch from `GET /api/v1/admin/users?page=X&limit=20&search=Y&role=Z`.
- Columns: Name, Email, Role (dropdown selector), Status badge (Active/Suspended), Joined date, Actions.
- Role selector: a `<select>` dropdown. On change, show a confirmation dialog: "Change [name]'s role from [old] to [new]?" with Confirm and Cancel. On confirm, call `PATCH /api/v1/admin/users/:id/role`.
- Status badge: green "Active", red "Suspended". Clicking calls deactivate/reactivate with confirmation.
- Search input: debounced 300ms, updates the fetch query.
- Role filter dropdown: All roles + individual role options.
- Pagination: Previous / Next with current page indicator.
- Show "Reset MFA" action only if current user's role is SUPER_ADMIN.

**Verification:**
- Navigate to `/admin/users` as ADMIN — table loads.
- Navigate to `/admin/users` as CLIENT — redirected to `/client-portal`.
- Change a user's role via the dropdown — confirm dialog appears, confirm, role updates in the table.
- Deactivate a user — status badge changes to Suspended.

---

### Task 1.3 — Permission map (ADMIN vs SUPER_ADMIN granularity)

**New file:** `packages/types/src/permissions.ts`

```typescript
export enum Permission {
  // Content
  MANAGE_BLOG       = 'MANAGE_BLOG',
  MANAGE_PORTFOLIO  = 'MANAGE_PORTFOLIO',
  MANAGE_TEAM       = 'MANAGE_TEAM',
  MANAGE_TESTIMONIALS = 'MANAGE_TESTIMONIALS',
  MANAGE_CONFIG     = 'MANAGE_CONFIG',       // site config — SUPER_ADMIN only

  // Users
  MANAGE_USERS      = 'MANAGE_USERS',
  ASSIGN_SUPER_ADMIN = 'ASSIGN_SUPER_ADMIN', // SUPER_ADMIN only

  // System
  VIEW_AUDIT_LOGS   = 'VIEW_AUDIT_LOGS',
  PURGE_RECYCLE_BIN = 'PURGE_RECYCLE_BIN',  // permanent delete — SUPER_ADMIN only
  RESET_MFA         = 'RESET_MFA',           // SUPER_ADMIN only
}
```

**New file:** `apps/api/src/common/constants/role-permissions.map.ts`

```typescript
import { Role } from '@mdms/types';
import { Permission } from '@mdms/types/permissions';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // all permissions
  [Role.ADMIN]: [
    Permission.MANAGE_BLOG,
    Permission.MANAGE_PORTFOLIO,
    Permission.MANAGE_TEAM,
    Permission.MANAGE_TESTIMONIALS,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [Role.PROJECT_MANAGER]: [],
  [Role.EDITOR]:   [],
  [Role.EMPLOYEE]: [],
  [Role.TALENT]:   [],
  [Role.CLIENT]:   [],
  [Role.GUEST]:    [],
};
```

> **Note:** The Permission map is informational for now and used by the frontend to conditionally show/hide UI elements. Full backend enforcement via a `PermissionsGuard` can replace `RolesGuard` in a future iteration — do not refactor the guard in this task.

**Verification:**
- `packages/types` builds: `pnpm --filter @mdms/types build`.
- The permission map imports cleanly in a test file.

---

### ✅ Phase 1 Complete Checklist

- [ ] `GET /api/v1/admin/users` returns paginated data with ADMIN token
- [ ] ADMIN cannot elevate a user to SUPER_ADMIN via the API
- [ ] User management page renders at `/admin/users` and is inaccessible to CLIENT role
- [ ] Role change confirmation dialog works
- [ ] `packages/types` builds with `Permission` enum exported
- [ ] Audit log has entries for all user management actions

---

## Phase 2 — CMS Hardening

> Only start Phase 2 after Phase 1 checklist is complete.
> Estimated time: 6–8 hours.

---

### Task 2.1 — Add ValidationPipe globally and write CMS DTOs

**Edit:** `apps/api/src/main.ts`

Ensure global pipe is set with strict options:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // strip unknown fields
    forbidNonWhitelisted: true,   // throw if unknown fields sent
    transform: true,              // auto-transform types
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

**New files to create** (one per content type):

**`apps/api/src/cms/dto/upsert-blog-post.dto.ts`**

```typescript
import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength, IsUrl } from 'class-validator';

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ARCHIVED = 'ARCHIVED',
}

export class UpsertBlogPostDto {
  @IsString() @MinLength(3) @MaxLength(200)
  title: string;

  @IsString() @MinLength(3) @MaxLength(300)
  slug: string;

  @IsString() @MaxLength(500)
  excerpt: string;

  @IsString()
  content: string; // HTML from TipTap (will be sanitized in service)

  @IsOptional() @IsUrl()
  coverImage?: string;

  @IsOptional() @IsEnum(BlogPostStatus)
  status?: BlogPostStatus = BlogPostStatus.DRAFT;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsString({ each: true })
  tags?: string[];
}
```

**`apps/api/src/cms/dto/upsert-portfolio-item.dto.ts`**

```typescript
import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, Min, MaxLength } from 'class-validator';

export class UpsertPortfolioItemDto {
  @IsString() @MaxLength(200)
  title: string;

  @IsString() @MaxLength(300)
  slug: string;

  @IsString() @MaxLength(1000)
  description: string;

  @IsOptional() @IsUrl()
  coverImage?: string;

  @IsOptional() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
```

**`apps/api/src/cms/dto/upsert-testimonial.dto.ts`**

```typescript
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';

export class UpsertTestimonialDto {
  @IsString() @MaxLength(200)
  clientName: string;

  @IsOptional() @IsString() @MaxLength(200)
  clientTitle?: string;

  @IsOptional() @IsString() @MaxLength(200)
  clientCompany?: string;

  @IsString() @MaxLength(2000)
  content: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  rating?: number;

  @IsOptional() @IsBoolean()
  isApproved?: boolean;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}
```

**`apps/api/src/cms/dto/upsert-team-member.dto.ts`**

```typescript
import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, Min, MaxLength, IsEmail } from 'class-validator';

export class UpsertTeamMemberDto {
  @IsString() @MaxLength(200)
  name: string;

  @IsString() @MaxLength(200)
  role: string;

  @IsOptional() @IsString() @MaxLength(1000)
  bio?: string;

  @IsOptional() @IsUrl()
  photo?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
```

**`apps/api/src/cms/dto/set-config.dto.ts`**

```typescript
import { IsObject, IsString } from 'class-validator';

export class SetConfigDto {
  @IsObject()
  value: Record<string, unknown>;
}
```

**Edit:** `apps/api/src/cms/cms.controller.ts`

Replace all `@Body() body: any` with the appropriate DTO type. Example:

```typescript
// BEFORE
@Post('admin/blog')
async createBlogPost(@Body() body: any, @Request() req) { ... }

// AFTER
@Post('admin/blog')
async upsertBlogPost(@Body() dto: UpsertBlogPostDto, @CurrentUser() user: JwtPayload) { ... }
```

Do this for every CMS write endpoint.

**Verification:**
- `POST /api/v1/cms/admin/blog` with an empty body → `400 Bad Request` with validation errors.
- `POST /api/v1/cms/admin/blog` with a valid body → `201 Created`.
- `POST /api/v1/cms/admin/blog` with an extra unknown field (e.g. `"hack": "me"`) → `400 Bad Request`.

---

### Task 2.2 — Implement blog post scheduling with cron

**Install:** `pnpm --filter api add @nestjs/schedule`

**Edit:** `apps/api/src/cms/cms.module.ts`

```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ...existing imports
  ],
  // ...
})
```

**New file:** `apps/api/src/cms/cms-scheduler.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CmsSchedulerService {
  private readonly logger = new Logger(CmsSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduledPosts() {
    const now = new Date();
    const posts = await this.prisma.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
        deletedAt: null,
      },
    });

    for (const post of posts) {
      await this.prisma.blogPost.update({
        where: { id: post.id },
        data: { status: 'PUBLISHED', publishedAt: now },
      });
      this.logger.log(`Auto-published blog post: ${post.slug}`);
      await this.auditService.log({
        actorId: 'SYSTEM',
        action: 'AUTO_PUBLISH_BLOG_POST',
        entityType: 'BlogPost',
        entityId: post.id,
        meta: { slug: post.slug },
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldRecycleBinItems() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // 30 days

    // Permanently delete soft-deleted items older than 30 days
    const models = ['blogPost', 'portfolioItem', 'testimonial', 'teamMember'] as const;
    for (const model of models) {
      const deleted = await (this.prisma[model] as any).deleteMany({
        where: { deletedAt: { lte: cutoff } },
      });
      if (deleted.count > 0) {
        this.logger.log(`Purged ${deleted.count} old ${model} items from recycle bin.`);
      }
    }
  }
}
```

Add `CmsSchedulerService` to `CmsModule` providers.

**Verification:**
- Create a blog post with `status: SCHEDULED` and `scheduledAt` set to 1 minute in the past.
- Wait for the cron to fire (or trigger manually in a test) → post status changes to `PUBLISHED`.
- Check audit log contains `AUTO_PUBLISH_BLOG_POST` entry.

---

### Task 2.3 — Wire AuditLog into CMS mutations

**Edit:** `apps/api/src/cms/cms.service.ts`

Inject `AuditService` in the constructor. Then add an audit log call after every create, update, and delete:

```typescript
// After upsertBlogPost:
await this.auditService.log({
  actorId: userId,
  action: isNew ? 'CREATE_BLOG_POST' : 'UPDATE_BLOG_POST',
  entityType: 'BlogPost',
  entityId: result.id,
  meta: { slug: result.slug, title: result.title },
});

// After softDeleteBlogPost:
await this.auditService.log({
  actorId: userId,
  action: 'DELETE_BLOG_POST',
  entityType: 'BlogPost',
  entityId: id,
});
```

Apply the same pattern for portfolio, testimonial, team member, FAQ, service, announcement, and system config mutations.

**Also fix authorId fallback:**

In every CMS service method, change:

```typescript
// BEFORE
authorId: req.user?.id || 'admin',

// AFTER — userId must come from the JWT payload, which the guard guarantees is present
authorId: userId, // passed from controller via @CurrentUser() decorator
```

If `userId` is somehow absent despite the guard, throw an `InternalServerErrorException` rather than silently using `'admin'`.

**Verification:**
- Create a blog post via the API.
- Check the `AuditLog` table — must have a `CREATE_BLOG_POST` entry with the correct `actorId`.
- Check that `authorId` on the created post is a real user UUID, not the string `'admin'`.

---

### Task 2.4 — Fix recycle bin dynamic model access

**Edit:** `apps/api/src/cms/cms.service.ts`

Find `restoreFromBin` and `permanentDelete` methods. Replace `this.prisma[modelType]` with a validated map:

```typescript
private getModel(modelType: string) {
  const MODEL_MAP = {
    blog:         this.prisma.blogPost,
    portfolio:    this.prisma.portfolioItem,
    testimonial:  this.prisma.testimonial,
    team:         this.prisma.teamMember,
    faq:          this.prisma.faqItem,
    service:      this.prisma.service,
    announcement: this.prisma.announcement,
  } as const;

  const model = MODEL_MAP[modelType as keyof typeof MODEL_MAP];
  if (!model) {
    throw new BadRequestException(`Unknown content type: ${modelType}`);
  }
  return model;
}

// Then use:
const model = this.getModel(modelType);
await (model as any).update({ where: { id }, data: { deletedAt: null } });
```

**Verification:**
- `POST /api/v1/cms/admin/recycle-bin/restore` with `{ modelType: 'blog', id: '...' }` → restores item.
- `POST /api/v1/cms/admin/recycle-bin/restore` with `{ modelType: 'injected_malicious_model', id: '...' }` → returns `400 Bad Request`.

---

### Task 2.5 — Remove PublicController duplicate

**File to delete:** `apps/api/src/public/public.controller.ts`

Before deleting, verify that every route in `PublicController` is covered by a `@Public()` endpoint in `CmsController`. If any route is missing from `CmsController`, add it there first, then delete `PublicController`.

Remove `PublicModule` from `app.module.ts` imports after deletion.

**Verification:**
- `pnpm --filter api build` — must compile.
- `GET /api/v1/cms/portfolio` (public) → returns data.
- All public-facing routes still work.

---

### ✅ Phase 2 Complete Checklist

- [ ] Empty body to any CMS write endpoint returns `400` with validation messages
- [ ] Unknown fields in request body return `400`
- [ ] Scheduled posts auto-publish when `scheduledAt <= now`
- [ ] Recycle bin auto-purges items older than 30 days (nightly)
- [ ] Every CMS mutation creates an `AuditLog` entry
- [ ] No blog post has `authorId = 'admin'`
- [ ] `this.prisma[modelType]` is gone — replaced with `getModel()` validated map
- [ ] `PublicController` deleted, all routes now in `CmsController`

---

## Phase 3 — Rich Content Management

> Only start Phase 3 after Phase 2 checklist is complete.
> Estimated time: 16–24 hours.

---

### Task 3.1 — Rich text editor (TipTap) for blog posts

**Install in web app:**

```bash
pnpm --filter web add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```

**Install sanitizer in api:**

```bash
pnpm --filter api add sanitize-html
pnpm --filter api add -D @types/sanitize-html
```

**New file:** `apps/web/components/editor/RichTextEditor.tsx`

This must be a `'use client'` component. It should:
- Use TipTap's `useEditor` hook with `StarterKit`, `Image`, `Link`, `Placeholder` extensions.
- Render a toolbar with buttons: Bold, Italic, Underline, H1, H2, H3, Bullet list, Ordered list, Blockquote, Link insert, Image insert (opens MediaLibrary modal).
- Accept `value: string` (HTML) and `onChange: (html: string) => void` props.
- Output raw HTML via `editor.getHTML()` on every content change.

**Edit:** `apps/api/src/cms/cms.service.ts`

In `upsertBlogPost`, sanitize incoming HTML before saving:

```typescript
import sanitizeHtml from 'sanitize-html';

const cleanContent = sanitizeHtml(dto.content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height'],
    a: ['href', 'target', 'rel'],
  },
});
```

**Edit:** `apps/web/app/(protected)/super-admin/cms/blog/page.tsx`

Replace any `<textarea>` used for blog content with `<RichTextEditor>`.

**Verification:**
- Open blog editor in `/super-admin/cms/blog` — rich text editor renders with toolbar.
- Type content, apply formatting, save — HTML is stored in DB and returned correctly.
- Attempt to save `<script>alert('xss')</script>` as content — script tag is stripped in the saved result.
- Attempt to save `<img onerror="evil()">` — `onerror` attribute is stripped.

---

### Task 3.2 — Media asset manager

**Prisma schema change** — add to `schema.prisma`:

```prisma
model MediaAsset {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  url         String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  uploadedById String
  uploadedBy  User     @relation(fields: [uploadedById], references: [id])
  createdAt   DateTime @default(now())

  @@index([uploadedById])
}
```

Run: `pnpm prisma migrate dev --name add_media_asset`

**Edit:** `apps/api/src/file/file.controller.ts`

Add media endpoints:

```typescript
@Post('upload')
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
@UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
async uploadMedia(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
  return this.fileService.uploadMediaAsset(file, user.sub);
}

@Get('assets')
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.EDITOR)
async listAssets(@Query() dto: PaginationDto) {
  return this.fileService.listAssets(dto);
}

@Delete('assets/:id')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
async deleteAsset(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
  return this.fileService.deleteAsset(id, user.sub);
}
```

Implement `fileService.uploadMediaAsset`: upload to Cloudinary (or configured S3), then save a `MediaAsset` record with the returned URL.

**New file:** `apps/web/components/admin/MediaLibrary.tsx`

A modal/drawer component that:
- Fetches `GET /api/v1/file/assets` with pagination.
- Displays a responsive grid of image thumbnails.
- Allows drag-and-drop file upload (calls `POST /api/v1/file/upload`).
- On image click, calls `onSelect(url: string)` callback and closes.
- Has a delete button (with confirmation) calling `DELETE /api/v1/file/assets/:id`.

**Verification:**
- Upload an image → record created in `MediaAsset` table, URL is a valid CDN URL.
- Open the media library in the blog editor → uploaded image appears.
- Click an image → URL is inserted into the rich text editor.
- Delete an image → removed from grid and from Cloudinary/S3.

---

### Task 3.3 — Draft preview

**Prisma schema** — add to `BlogPost` model:

```prisma
previewToken String? @unique
```

Run: `pnpm prisma migrate dev --name add_blog_preview_token`

**Edit:** `apps/api/src/cms/cms.service.ts`

In `upsertBlogPost`, regenerate the preview token on every save:

```typescript
import { randomUUID } from 'crypto';

data: {
  // ... other fields ...
  previewToken: randomUUID(),
}
```

**Add preview endpoint:**

```typescript
// In CmsController
@Get('preview/blog/:slug')
@Public()
async previewBlogPost(
  @Param('slug') slug: string,
  @Query('token') token: string,
) {
  return this.cmsService.getBlogPostBySlug(slug, token);
}
```

In `cmsService.getBlogPostBySlug`, if a `token` is provided, return the post regardless of `status` but verify `previewToken === token`. If token is wrong, throw `403`. If no token, only return `PUBLISHED` posts.

**Edit:** `apps/web/app/blog/[slug]/page.tsx`

Accept `searchParams.preview` as an optional token. If present, call the preview endpoint.

**Edit:** Blog editor in super-admin — add a "Preview" button that:

1. Saves the current draft (PATCH).
2. Opens `/blog/[slug]?preview=[previewToken]` in a new tab.

**Verification:**
- Published post: `/blog/my-post` → renders normally.
- Draft post: `/blog/my-post` → 404 (not found).
- Draft post with token: `/blog/my-post?preview=correct-token` → renders.
- Draft post with wrong token: `/blog/my-post?preview=wrong-token` → 403.

---

### Task 3.4 — Pagination on CMS admin lists

**New file:** `apps/api/src/common/dto/pagination.dto.ts`

```typescript
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @IsOptional() @IsString()
  orderBy?: string = 'createdAt';

  @IsOptional() @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc' = 'desc';
}
```

**Edit:** `apps/api/src/cms/cms.service.ts`

All admin list methods must accept `PaginationDto` and return `{ data, total, page, totalPages }`. Example:

```typescript
async listBlogPostsAdmin(dto: PaginationDto) {
  const { page = 1, limit = 20, orderBy = 'createdAt', direction = 'desc' } = dto;
  const [data, total] = await Promise.all([
    this.prisma.blogPost.findMany({
      where: { deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderBy]: direction },
    }),
    this.prisma.blogPost.count({ where: { deletedAt: null } }),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
}
```

Apply to: blog, portfolio, testimonials, team members, FAQ items, services, announcements, contact submissions, newsletter subscribers.

**Edit:** All CMS admin list endpoints in the controller to pass `@Query() dto: PaginationDto`.

**Verification:**
- `GET /api/v1/cms/admin/blog?page=1&limit=5` → returns at most 5 items and `{ total, page, totalPages }`.
- `GET /api/v1/cms/admin/blog?limit=999` → returns `400` (max is 100).

---

### Task 3.5 — Visual site config editor

**New page:** `apps/web/app/(protected)/super-admin/cms/site-config/page.tsx`

A tabbed interface with a tab per config key: Hero, Stats, Pricing, Navbar, Footer, SEO.

**New client components** (one per config section):

`HeroConfigForm.tsx` — fields:
- `heading: string` (text input)
- `subheading: string` (textarea)
- `ctaText: string` (text input)
- `ctaUrl: string` (text input)
- `backgroundImage: string` (url input + MediaLibrary picker button)

`FooterConfigForm.tsx` — fields:
- `companyName: string`
- `tagline: string`
- `socialLinks: { platform, url }[]` (repeater: add/remove rows)
- `copyrightText: string`

Each form:
1. On mount, fetches `GET /api/v1/cms/config/[key]` and populates fields.
2. On submit, calls `POST /api/v1/cms/admin/config/[key]` with the serialized JSON.
3. Shows a success toast on save.

**Verification:**
- Open `/super-admin/cms/site-config` → tabs render.
- Change hero heading, save → heading updated in `SystemConfig` table.
- Visit the public site → new heading renders.

---

### ✅ Phase 3 Complete Checklist

- [ ] Blog editor uses TipTap with toolbar
- [ ] `<script>` tags are stripped from saved blog content
- [ ] Image upload works; URLs appear in `MediaAsset` table
- [ ] Media library modal renders and allows selection
- [ ] Preview link opens draft post; wrong token gets 403
- [ ] All CMS admin list endpoints accept `page` and `limit` query params
- [ ] Site config editor tabs render and save correctly
- [ ] Public site reflects config changes

---

## Phase 4 — Admin UX Enhancements

> Only start Phase 4 after Phase 3 checklist is complete.
> Estimated time: 10–14 hours.

---

### Task 4.1 — Unified admin dashboard KPIs

**Edit:** `apps/api/src/admin/admin.service.ts`

Enrich `getDashboard()` to return:

```typescript
async getDashboard() {
  const [
    usersByRole,
    publishedPosts,
    draftPosts,
    scheduledPosts,
    portfolioItems,
    pendingTestimonials,
    openContacts,
    newsletterSubscribers,
    recentAuditLogs,
  ] = await Promise.all([
    this.prisma.user.groupBy({ by: ['role'], _count: true }),
    this.prisma.blogPost.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    this.prisma.blogPost.count({ where: { status: 'DRAFT', deletedAt: null } }),
    this.prisma.blogPost.count({ where: { status: 'SCHEDULED', deletedAt: null } }),
    this.prisma.portfolioItem.count({ where: { isPublished: true, deletedAt: null } }),
    this.prisma.testimonial.count({ where: { isApproved: false, deletedAt: null } }),
    this.prisma.contactSubmission.count({ where: { isRead: false } }),
    this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    this.prisma.auditLog.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true, role: true } } } }),
  ]);

  return {
    users: { byRole: usersByRole },
    content: { publishedPosts, draftPosts, scheduledPosts, portfolioItems, pendingTestimonials },
    engagement: { openContacts, newsletterSubscribers },
    recentActivity: recentAuditLogs,
  };
}
```

**Edit:** `apps/web/app/(protected)/admin/page.tsx`

Render KPI cards in a 3-column grid:
- Users by role (small bar or number per role)
- Blog: X published, Y drafts, Z scheduled
- Portfolio items
- Pending testimonials (link to `/super-admin/cms/testimonials?filter=pending`)
- Open contact submissions (link to `/admin/contacts`)
- Newsletter subscribers

Below cards: render a feed of `recentActivity` — each entry shows avatar initial, actor name, action, entity, and relative time.

**Verification:**
- Admin dashboard loads within 2 seconds.
- KPI numbers match the actual database counts.
- Recent activity feed shows the last 20 actions.

---

### Task 4.2 — Drag-and-drop content reordering

**Install:**

```bash
pnpm --filter web add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**New file:** `apps/web/components/admin/SortableList.tsx`

A generic `'use client'` component:

```typescript
interface SortableListProps<T extends { id: string; sortOrder: number }> {
  items: T[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  renderItem: (item: T, dragHandle: React.ReactNode) => React.ReactNode;
}
```

It wraps `@dnd-kit/sortable`'s `SortableContext`. On drag end, it calls `onReorder` with the new ID order.

**Edit:** Portfolio, testimonials, team member, and services admin list pages.

Wrap each list in `<SortableList>`. The `onReorder` callback calls:

```typescript
await fetch('/api/v1/cms/admin/portfolio/reorder', {
  method: 'POST',
  body: JSON.stringify({ orderedIds }),
});
```

The reorder endpoint already exists on the backend — just connect the frontend.

**Verification:**
- Drag a portfolio item up — it moves visually.
- Release — `POST /cms/admin/portfolio/reorder` is called.
- Reload the page — items are in the new order.
- Public portfolio page — items render in the reordered sequence.

---

### Task 4.3 — Audit log viewer

**Edit:** `apps/api/src/admin/admin.controller.ts`

Add filter params to the audit log endpoint:

```typescript
@Get('audit-logs')
@Roles(Role.SUPER_ADMIN)
async getAuditLogs(
  @Query('page') page = 1,
  @Query('limit') limit = 50,
  @Query('actorId') actorId?: string,
  @Query('action') action?: string,
  @Query('entityType') entityType?: string,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.adminService.getAuditLogs({ page: +page, limit: +limit, actorId, action, entityType, from, to });
}
```

**New page:** `apps/web/app/(protected)/super-admin/audit/page.tsx`

Filter bar:
- Search by actor name/email
- Filter by action type (dropdown: all unique action strings)
- Filter by entity type (dropdown: BlogPost, User, PortfolioItem, etc.)
- Date range (from / to date pickers)

Results table columns: Timestamp | Actor | Role | Action | Entity type | Entity ID

Clicking a row expands it to show `meta` JSON formatted as key-value pairs.

Accessible to SUPER_ADMIN only (middleware + server-side session check).

**Verification:**
- Create a blog post via the API.
- Open `/super-admin/audit` → `CREATE_BLOG_POST` entry appears.
- Filter by action `CREATE_BLOG_POST` → only that action shows.
- Click the row → meta JSON expands below.
- Access `/super-admin/audit` as ADMIN → redirected (403 or dashboard).

---

### Task 4.4 — Recycle bin UI

**New page:** `apps/web/app/(protected)/super-admin/cms/recycle-bin/page.tsx`

Fetches `GET /api/v1/cms/admin/recycle-bin`.

Groups results by content type (Blog Posts, Portfolio Items, Testimonials, Team Members).

Each item shows: title, deleted date, and two buttons:
- **Restore** — calls `POST /api/v1/cms/admin/recycle-bin/restore` with `{ modelType, id }`. Shows inline loading. On success, removes item from the list.
- **Delete forever** — shows a confirmation modal: "This cannot be undone. Delete [title] permanently?" On confirm, calls `DELETE /api/v1/cms/admin/recycle-bin/:modelType/:id`.

Shows an info banner: "Items are automatically purged after 30 days."

**Verification:**
- Soft-delete a blog post via the API.
- Open `/super-admin/cms/recycle-bin` → post appears.
- Click Restore → post disappears from recycle bin, reappears in blog list.
- Soft-delete again → click Delete forever with confirmation → post is gone from DB.

---

### Task 4.5 — Content calendar

**Install:**

```bash
pnpm --filter web add react-big-calendar date-fns
pnpm --filter web add -D @types/react-big-calendar
```

**New page:** `apps/web/app/(protected)/super-admin/cms/calendar/page.tsx`

Uses `react-big-calendar` with `date-fns` localizer.

Fetches all blog posts: `GET /api/v1/cms/admin/blog?limit=100` (or a dedicated calendar endpoint that returns minimal `{ id, title, status, publishedAt, scheduledAt }` for all non-archived posts).

Maps posts to calendar events:
- `PUBLISHED` posts: event date = `publishedAt`, green color.
- `SCHEDULED` posts: event date = `scheduledAt`, amber color.
- `DRAFT` posts: not shown (optional toggle to include them in gray).

Clicking an event navigates to `href="/super-admin/cms/blog/edit/[id]"`.

Legend: green = published, amber = scheduled.

**Verification:**
- Scheduled posts appear on the calendar on their `scheduledAt` date.
- Published posts appear on their `publishedAt` date.
- Clicking an event opens the blog editor for that post.

---

### ✅ Phase 4 Complete Checklist

- [ ] Admin dashboard shows accurate KPI counts and recent activity feed
- [ ] Portfolio/testimonials/team/services lists are drag-reorderable
- [ ] Reordering persists after page reload
- [ ] Audit log viewer at `/super-admin/audit` is accessible only to SUPER_ADMIN
- [ ] Audit log filters (action, entity type, date range) work correctly
- [ ] Recycle bin page shows all soft-deleted items grouped by type
- [ ] Restore and permanent delete work correctly
- [ ] Content calendar shows scheduled and published posts by date

---

## Final Verification — Full System Smoke Test

Run this sequence after all phases are complete:

1. **Start both apps:** `pnpm dev`
2. **Auth flow:** Register a new CLIENT, log in, confirm you land on `/client-portal`. Attempt to navigate to `/super-admin` — confirm redirect.
3. **Role change:** As SUPER_ADMIN, change the CLIENT's role to EDITOR via `/admin/users`. Log out as CLIENT, log back in — confirm you land on `/editor-portal`.
4. **CMS create:** As SUPER_ADMIN, create a blog post via the rich text editor. Set status to SCHEDULED with a time 2 minutes in the future. Wait — confirm it auto-publishes.
5. **Preview:** Create a draft post, click Preview — confirm it renders. Modify the preview URL token — confirm 403.
6. **Media upload:** Upload an image in the media library. Insert it into the blog post. Confirm the URL in the saved HTML is the CDN URL.
7. **Site config:** Update the hero heading in the config editor. Confirm it changes on the public home page.
8. **Reorder:** Drag a portfolio item in the admin list. Reload — confirm order persists. Confirm public portfolio page reflects new order.
9. **Recycle bin:** Delete a testimonial. Go to recycle bin — confirm it appears. Restore it — confirm it's back in the testimonials list.
10. **Audit log:** Open `/super-admin/audit`. Confirm all the actions from steps 3–9 appear with correct actor, action, and entity.
11. **Security:** `curl -X POST http://localhost:3001/api/v1/cms/admin/blog` with no token → must return `401`. With CLIENT token → must return `403`. With ADMIN token and empty body → must return `400`.

---

## Common Mistakes to Avoid

- **Do not** use `any` on DTO bodies — use typed classes with decorators.
- **Do not** call `this.prisma[dynamicString]` — use a validated map.
- **Do not** log OTP values, tokens, or passwords.
- **Do not** start Phase 1 before Phase 0's role casing fix is verified working end-to-end.
- **Do not** add new public endpoints without `@Public()` — the global guard now blocks everything by default.
- **Do not** skip migration after Prisma schema changes.
- **Do not** hardcode role strings as lowercase — always use the `Role` enum from `@mdms/types`.
- **Do not** store unverified HTML from user input — always run through `sanitize-html` before persisting.
