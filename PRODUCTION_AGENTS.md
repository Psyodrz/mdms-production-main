# MDMS — Production Readiness Agent Instructions
# Remove All Mock Data & Wire Real Connectivity

> **For the executing agent:**
> Read every word of this file before touching any code.
> This document is the only source of truth. Do not invent shortcuts.
> Execute sections in the exact order listed. Do not skip ahead.
> After every task: verify, then move on. A half-done task is worse than not starting.

---

## Mission Statement

The codebase currently has **mock data, fake auth bypasses, simulated payments, and hardcoded content**
scattered across the frontend and backend. The goal of this session is to remove every single one of
these and replace them with real database queries, real service integrations, and real auth flows.

The delivered output must be a production-ready system where:
- No hardcoded user credentials exist anywhere
- No `x-mock-user-id` header bypass exists anywhere
- No in-memory arrays are used as a database substitute
- No fake S3 URLs, mock order IDs, or simulated payment webhooks exist
- No hardcoded talent profiles, blog posts, testimonials, or content arrays exist
- All data comes from the database (Prisma + PostgreSQL)
- All file uploads go to a real storage provider (Cloudinary or AWS S3)
- All payments go through real Razorpay API calls

---

## Environment Variables Required

Before writing any code, create or update the following `.env` files.
The agent must not hardcode any of these values.

### `apps/api/.env`

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/mdms_production

# Auth
AUTH_SECRET=                    # generate: openssl rand -base64 64
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary (for file/media uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=mdms_uploads

# Razorpay (real credentials — use test keys during development)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email (SMTP for OTP delivery)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# WhatsApp / Twilio (optional — leave blank to disable)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
```

### `apps/web/.env.local`

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=              # same value as AUTH_SECRET above

NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# Cloudinary public config
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mdms_uploads

# Razorpay public key (safe to expose)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## Agent Rules — Absolute

1. **Never leave a `TODO: replace with real` comment and move on.** Complete the replacement in the same task.
2. **Never use `any` as a type on a database result or API response.** Type everything.
3. **Never use in-memory arrays** (`let users = []`, `MOCK_USERS`, etc.) as a data store. All persistence goes through Prisma.
4. **Never hardcode IDs, slugs, names, images, or credentials** in component or service files.
5. **Every mock file must be deleted**, not just commented out or disabled with a flag.
6. **Environment variables must be read with a startup check** — throw if a required variable is missing.
7. **After removing mock data, every affected page must still render** — with empty states (not crashes) when the database has no data.
8. **Razorpay: never call the simulation method in any code path** — not even behind a flag.
9. **S3/Cloudinary: never return a hardcoded URL** — all upload functions must call the real SDK.
10. **The `x-mock-user-id` header bypass must be deleted entirely**, not conditionally skipped.

---

## Section 1 — Authentication & Session Management

### Task 1.1 — Delete MOCK_USERS and wire real database auth

**File to delete (entire mock block):** `apps/web/lib/auth.ts` (or wherever `MOCK_USERS` is defined)

Find and **delete** the `MOCK_USERS` constant entirely. It will look like:

```typescript
// DELETE THIS ENTIRE BLOCK
const MOCK_USERS = [
  { id: '1', email: 'admin@...', role: 'SUPER_ADMIN', ... },
  { id: '2', email: 'studio@...', role: 'ADMIN', ... },
  { id: '3', email: 'client@...', role: 'CLIENT', ... },
  { id: '4', email: 'elena@...', role: 'TALENT', ... },
];
```

Replace the auth lookup logic with a real API call to the backend:

```typescript
// apps/web/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp:      { label: 'OTP',      type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email:    credentials.email,
            password: credentials.password,
            otp:      credentials.otp,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        // Backend returns { user: { id, email, name, role }, accessToken, refreshToken }
        return {
          id:           data.user.id,
          email:        data.user.email,
          name:         data.user.name,
          role:         data.user.role,
          accessToken:  data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id           = user.id;
        token.role         = user.role;
        token.accessToken  = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id          = token.id as string;
      session.user.role        = token.role as string;
      session.accessToken      = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: { strategy: 'jwt' },
};
```

**Verification:**
- `MOCK_USERS` constant does not exist anywhere in the codebase (`grep -r "MOCK_USERS" .` → zero results).
- Login with real credentials from the database → session established.
- Login with wrong credentials → redirected to `/login` with error.

---

### Task 1.2 — Fix in-memory user registration

**Files to fix:**
- `apps/web/app/api/register/route.ts`
- `apps/web/app/api/register-talent-dynamic/route.ts`

**Problem:** Both routes push new users into the in-memory `MOCK_USERS` array.

**Fix:** These BFF routes must forward the registration request to the real NestJS API:

```typescript
// apps/web/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || 'Registration failed' },
      { status: res.status },
    );
  }

  return NextResponse.json(data, { status: 201 });
}
```

Apply the same pattern to `register-talent-dynamic/route.ts` — proxy to
`/auth/register-talent` on the backend. No local array, no local user creation.

**Verification:**
- Register a new user → record appears in the `User` table in PostgreSQL.
- Registering with the same email again → returns `409 Conflict` from the backend.
- The in-memory array is nowhere referenced after registration (`grep -r "MOCK_USERS.push" .` → zero results).

---

### Task 1.3 — Delete x-mock-user-id bypass in JwtAuthGuard

**File to fix:** `apps/api/src/common/guards/jwt-auth.guard.ts`

Find and **delete entirely** any block resembling:

```typescript
// DELETE THIS ENTIRE BLOCK — no conditions, no flags, just delete
const mockUserId = request.headers['x-mock-user-id'];
if (mockUserId && process.env.NODE_ENV !== 'production') {
  request.user = {
    sub:   mockUserId,
    email: 'demo@talent.com',
    role:  'TALENT',
  };
  return true;
}
```

After deletion, the guard should only validate real JWT tokens. Nothing else.

**Also delete** from the BFF proxy routes:

**Files:** `apps/web/app/api/draft/route.ts`, `apps/web/app/api/submit/route.ts`

Find and delete:

```typescript
// DELETE — fallback mock user ID
const userId = session?.user?.id ?? 'mock-talent-user-1';
headers['x-mock-user-id'] = userId;
```

Replace with:

```typescript
// FIXED — if no session, return 401. Never use a fallback ID.
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
// Forward the real bearer token
headers['Authorization'] = `Bearer ${session.accessToken}`;
```

**Verification:**
- `grep -r "x-mock-user-id" .` → zero results anywhere in the codebase.
- `grep -r "mock-talent-user" .` → zero results.
- Calling a protected API endpoint without a token → `401 Unauthorized`.
- `grep -r "mock_user\|MOCK_USER\|mockUser" apps/api/src` → zero results.

---

## Section 2 — Talent & Booking Roster

### Task 2.1 — Remove hardcoded talent profile mappings

**File to fix:** The talent profile `page.tsx` containing `MOCK_PROFILES`.

**Find and delete:**

```typescript
// DELETE THIS ENTIRE BLOCK
const MOCK_PROFILES: Record<string, string> = {
  'aarya-k':  'https://images.unsplash.com/...',
  'rohan-m':  'https://images.unsplash.com/...',
  // ... other entries
};
```

**Also delete** the fallback block generating dummy profiles for slugs starting with `mock-`:

```typescript
// DELETE THIS ENTIRE BLOCK
if (slug.startsWith('mock-')) {
  return {
    name: 'Mock Talent',
    bio: 'This is a placeholder bio...',
    followers: 12000,
    // ...
  };
}
```

**Replace with a real database fetch:**

```typescript
// apps/web/app/(public)/talent/[slug]/page.tsx
import { notFound } from 'next/navigation';

async function getTalentProfile(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/talent/profile/${slug}`,
    { next: { revalidate: 60 } }, // ISR: revalidate every 60s
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch talent profile');
  return res.json();
}

export default async function TalentProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getTalentProfile(params.slug);
  if (!profile) notFound();

  return <TalentProfileView profile={profile} />;
}

// Add proper empty/loading state in TalentProfileView — never crash on missing fields
```

**Verification:**
- `grep -r "MOCK_PROFILES\|mock-\|unsplash.com" apps/web/app/(public)/talent` → zero results.
- Visiting `/talent/[real-slug]` loads data from the database.
- Visiting `/talent/nonexistent-slug` → renders the Next.js 404 page.

---

### Task 2.2 — Remove hardcoded booking inquiry slugs

**File to fix:** Booking inquiry `page.tsx` containing `MOCK_SLUGS`.

**Find and delete:**

```typescript
// DELETE
const MOCK_SLUGS = ['aarya-k', 'rohan-m', 'priya-s', ...];
```

Replace with a fetch from the backend:

```typescript
// Fetch available talent for booking from the real API
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/talent?isAvailableForBooking=true`, {
  next: { revalidate: 30 },
});
const { data: talents } = await res.json();
```

**Verification:**
- `grep -r "MOCK_SLUGS" .` → zero results.
- Booking page shows only talents that have `isAvailableForBooking: true` in the database.

---

### Task 2.3 — Remove static featured talent list from TalentShowcase

**File to fix:** `apps/web/components/TalentShowcase.tsx`

**Find and delete:**

```typescript
// DELETE THIS ENTIRE STATIC ARRAY
const FEATURED_TALENTS = [
  { name: 'Elena Rostova', image: 'https://images.unsplash.com/...', ... },
  { name: 'Marcus Chen',   image: 'https://images.unsplash.com/...', ... },
  { name: 'Sofia Martinez',image: 'https://images.unsplash.com/...', ... },
  { name: 'Julian King',   image: 'https://images.unsplash.com/...', ... },
];
```

Replace with server-side fetched data passed as props from the parent page,
or fetch inside the component if it's a server component:

```typescript
// If TalentShowcase is a server component:
async function TalentShowcase() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/talent/featured`,
    { next: { revalidate: 300 } },
  );

  if (!res.ok) {
    // Never crash — show empty state
    return <TalentShowcaseSkeleton />;
  }

  const talents = await res.json();

  if (!talents.length) {
    return <p className="text-center text-muted">No featured talent yet.</p>;
  }

  return (
    <div className="grid ...">
      {talents.map((t: TalentProfile) => (
        <TalentCard key={t.id} talent={t} />
      ))}
    </div>
  );
}
```

Ensure the backend has a `GET /talent/featured` endpoint that returns talent with
`isFeatured: true` ordered by `sortOrder`. If this endpoint doesn't exist,
add it to `talent.controller.ts` with `@Public()`.

**Verification:**
- `grep -r "Elena Rostova\|Marcus Chen\|Sofia Martinez\|Julian King" .` → zero results.
- `grep -r "unsplash.com" apps/web/components/TalentShowcase` → zero results.
- Component renders real data or a clean empty state.

---

## Section 3 — Projects & Portfolio

### Task 3.1 — Replace simulated video players with real video embed

**Files to fix:**
- `apps/web/app/(public)/projects/[slug]/page.tsx`
- `apps/web/app/(public)/portfolio/[slug]/page.tsx`

**Find and delete** any block that renders a fake video player — typically a `div`
with a play-button overlay positioned over a cover image:

```typescript
// DELETE — fake video player
<div className="relative aspect-video bg-black">
  <img src={project.coverImage} className="w-full h-full object-cover opacity-60" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
      ▶
    </div>
  </div>
</div>
```

**Replace with a real video component:**

```typescript
// apps/web/components/VideoPlayer.tsx
'use client';

interface VideoPlayerProps {
  videoUrl: string;        // Cloudinary or S3 URL
  cloudinaryPublicId?: string; // If using Cloudinary
  posterUrl?: string;
}

export function VideoPlayer({ videoUrl, posterUrl }: VideoPlayerProps) {
  if (!videoUrl) return null;

  // Cloudinary video URL — use their video player or native HTML5
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        controls
        preload="metadata"
        poster={posterUrl}
        className="w-full h-full"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
```

The `videoUrl` must come from the project's database record (stored in
`project.videoUrl` or `version.videoUrl` — whichever field holds the real
Cloudinary/S3 URL after upload). If the project has no video, render nothing
(not a fake play button).

**Verification:**
- `grep -r "play-button\|▶\|mock.*video\|simulated.*video\|overlay.*play" apps/web` → zero results.
- A project with a real Cloudinary video URL → video plays in the browser.
- A project with no video URL → no video section rendered.

---

### Task 3.2 — Remove hardcoded scroll section products

**File to fix:** `apps/web/components/cinematic-product-scroll-section.tsx`

**Find and delete:**

```typescript
// DELETE THIS ENTIRE ARRAY
const MOCK_PRODUCTS = [
  { title: 'Neon Silk Campaign', image: '/assets/project-fashion.jpg', color: '#ff6b35', ... },
  { title: 'Midnight Anthem',    image: '/assets/project-music.jpg',   color: '#1a1a2e', ... },
  // ...
];
```

**Replace with props — the component receives real data from its parent:**

```typescript
// AFTER — component accepts real data
interface ProductScrollItem {
  id:          string;
  title:       string;
  coverImage:  string;
  accentColor?: string;
  slug:        string;
  category:   string;
}

interface CinematicProductScrollSectionProps {
  items: ProductScrollItem[];
}

export function CinematicProductScrollSection({ items }: CinematicProductScrollSectionProps) {
  if (!items.length) return null;
  // ... render using items prop, not any hardcoded array
}
```

In the parent page component (home page or portfolio page), fetch real portfolio items
from the API and pass them as the `items` prop:

```typescript
// In parent page.tsx (server component)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/portfolio?limit=6`, {
  next: { revalidate: 120 },
});
const { data: portfolioItems } = await res.json();

return (
  <CinematicProductScrollSection items={portfolioItems} />
);
```

**Verification:**
- `grep -r "MOCK_PRODUCTS\|Neon Silk\|Midnight Anthem" .` → zero results.
- `grep -r "/assets/project-fashion\|/assets/project-music" .` → zero results.
- Section renders real portfolio items from the DB or renders nothing if DB is empty.

---

## Section 4 — Client & Editor Portals

### Task 4.1 — Replace hardcoded casting board with real API data

**File to fix:** `apps/web/app/(protected)/client-portal/casting/page.tsx`

**Find and delete the entire hardcoded mock:**

```typescript
// DELETE THIS ENTIRE BLOCK
const MOCK_CASTING_CALLS = [
  {
    id: '1',
    title: 'Summer Fashion Campaign',
    applicants: [
      { id: 'a1', name: 'Elena Smith', status: 'pending', ... },
      // ...
    ],
  },
];
```

**Replace with a real server component that fetches from the backend:**

```typescript
// apps/web/app/(protected)/client-portal/casting/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CastingBoard } from '@/components/client/CastingBoard';

export default async function CastingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/bookings/casting-calls`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store', // casting data must be fresh
    },
  );

  if (!res.ok) {
    return <p className="text-center py-20">Failed to load casting calls.</p>;
  }

  const { data: castingCalls } = await res.json();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Casting Board</h1>
      {castingCalls.length === 0
        ? <EmptyCastingState />
        : <CastingBoard castingCalls={castingCalls} />
      }
    </div>
  );
}
```

**Verification:**
- `grep -r "Summer Fashion Campaign\|MOCK_CASTING" .` → zero results.
- Casting page renders real bookings for the logged-in client.
- No bookings in DB → clean empty state rendered, no crash.

---

### Task 4.2 — Remove talent dashboard fallback profile

**Files to fix:**
- `apps/web/app/(protected)/talent-dashboard/page.tsx`
- `apps/web/app/(protected)/talent-dashboard/edit/page.tsx`

**Find and delete:**

```typescript
// DELETE THIS ENTIRE OBJECT
const FALLBACK_TALENT_PROFILE = {
  name:     'Demo Talent',
  bio:      'This is a placeholder bio...',
  views:    4200,
  hireRequests: [...mockRequests],
  applications: [...mockApplications],
  // ...
};
```

**And delete** any logic that uses it as a fallback when token validation fails:

```typescript
// DELETE
if (!isTokenValid) {
  return <TalentDashboard profile={FALLBACK_TALENT_PROFILE} />;
}
```

**Replace with proper auth-guarded fetch:**

```typescript
// apps/web/app/(protected)/talent-dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TalentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'TALENT') redirect('/login');

  const [profileRes, statsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/talent/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store',
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/talent/me/stats`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store',
    }),
  ]);

  if (!profileRes.ok) {
    // Real error — tell the user, do not substitute fake data
    return <DashboardError message="Could not load your profile. Please try again." />;
  }

  const profile = await profileRes.json();
  const stats   = statsRes.ok ? await statsRes.json() : null;

  return <TalentDashboardView profile={profile} stats={stats} />;
}
```

**Verification:**
- `grep -r "FALLBACK_TALENT_PROFILE\|Demo Talent\|placeholder bio\|mockRequests\|mockApplications" .` → zero results.
- Talent dashboard loads real data when logged in as a TALENT user.
- Session expiry → redirect to `/login`, not fallback profile.

---

### Task 4.3 — Replace simulated file uploader with real Cloudinary upload

**File to fix:** `apps/web/components/editor/UploadVersionUI.tsx`

**Find and delete the simulated upload using `setInterval`:**

```typescript
// DELETE THIS ENTIRE BLOCK
const simulateUpload = () => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    setUploadProgress(progress);
    if (progress >= 100) {
      clearInterval(interval);
      alert('Version uploaded successfully! (Mock Action)');
    }
  }, 300);
};
```

**Replace with real upload logic:**

```typescript
// apps/web/components/editor/UploadVersionUI.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function UploadVersionUI({ projectId }: { projectId: string }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.accessToken) return;

    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    try {
      // Use XMLHttpRequest to get real upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setStatus('success');
          setProgress(100);
        } else {
          setStatus('error');
          setErrorMsg('Upload failed. Please try again.');
        }
      });

      xhr.addEventListener('error', () => {
        setStatus('error');
        setErrorMsg('Network error during upload.');
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/file/upload-version`);
      xhr.setRequestHeader('Authorization', `Bearer ${session.accessToken}`);
      xhr.send(formData);
    } catch {
      setStatus('error');
      setErrorMsg('Unexpected error. Please try again.');
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleUpload} disabled={status === 'uploading'} />
      {status === 'uploading' && (
        <div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <p>{progress}% uploaded</p>
        </div>
      )}
      {status === 'success' && <p className="text-green-600">Version uploaded successfully.</p>}
      {status === 'error'   && <p className="text-red-600">{errorMsg}</p>}
    </div>
  );
}
```

**Backend — implement real upload endpoint:**

`apps/api/src/file/file.controller.ts` — add `POST /file/upload-version`:

```typescript
@Post('upload-version')
@Roles(Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN)
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB max
}))
async uploadVersion(
  @UploadedFile() file: Express.Multer.File,
  @Body('projectId') projectId: string,
  @CurrentUser() user: JwtPayload,
) {
  return this.fileService.uploadProjectVersion(file, projectId, user.sub);
}
```

`apps/api/src/file/file.service.ts` — implement `uploadProjectVersion`:

```typescript
async uploadProjectVersion(
  file: Express.Multer.File,
  projectId: string,
  uploadedById: string,
) {
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload_stream_promise(file.buffer, {
    resource_type: 'video',
    folder:        `mdms/projects/${projectId}/versions`,
    use_filename:  true,
  });

  // Save version record in DB
  const version = await this.prisma.version.create({
    data: {
      projectId,
      uploadedById,
      videoUrl:   result.secure_url,
      publicId:   result.public_id,
      duration:   result.duration,
      size:       file.size,
      filename:   file.originalname,
      status:     'PROCESSING',
    },
  });

  return version;
}
```

**Verification:**
- `grep -r "Mock Action\|simulateUpload\|setInterval.*progress\|Version uploaded.*Mock" .` → zero results.
- Upload a real video file → progress bar reflects actual upload.
- After upload → `Version` record exists in the database with a real Cloudinary URL.
- `grep -r "mock-s3-bucket\|mock_s3\|fake.*upload" apps/api/src` → zero results.

---

### Task 4.4 — Replace MockEditorWorkspace and MockClientWorkspace

**Files to fix:**
- `apps/web/app/(protected)/editor-portal/[projectId]/page.tsx`
- `apps/web/app/(protected)/client-portal/[projectId]/page.tsx`

**Find and delete both mock workspace components entirely:**

```typescript
// DELETE — MockEditorWorkspace
function MockEditorWorkspace() {
  return (
    <div>
      <h1>Sample Brand Campaign</h1>
      <p>Status: EDITING</p>
      {/* ... fake versions, fake comments */}
    </div>
  );
}

// DELETE — MockClientWorkspace
function MockClientWorkspace() {
  return (
    <div>
      <h1>Sample Brand Campaign</h1>
      <p>Status: REVIEW</p>
      {/* ... fake versions, fake comments */}
    </div>
  );
}
```

**Replace each page with a real data-fetching server component:**

```typescript
// apps/web/app/(protected)/editor-portal/[projectId]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { EditorWorkspace } from '@/components/editor/EditorWorkspace';

export default async function EditorProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/editor/projects/${params.projectId}`,
    {
      headers:  { Authorization: `Bearer ${session.accessToken}` },
      cache:    'no-store',
    },
  );

  if (res.status === 404) notFound();
  if (res.status === 403) redirect('/editor-portal');
  if (!res.ok) throw new Error('Failed to load project');

  const project = await res.json();

  return <EditorWorkspace project={project} session={session} />;
}
```

Apply the same pattern for `client-portal/[projectId]/page.tsx`, fetching from
`/client/projects/:projectId`.

**Verification:**
- `grep -r "MockEditorWorkspace\|MockClientWorkspace\|Sample Brand Campaign\|EDITING.*mock\|REVIEW.*mock" .` → zero results.
- Visiting `/editor-portal/[real-project-id]` as an assigned EDITOR → real project loads.
- Visiting `/editor-portal/[project-id-not-assigned]` as an EDITOR → redirected to `/editor-portal`.
- Visiting `/editor-portal/nonexistent-id` → 404 page.

---

## Section 5 — Services, Storage & Payments

### Task 5.1 — Replace mock S3 URLs with real Cloudinary uploads

**Files to fix:**
- `apps/api/src/project/project.service.ts`
- `apps/api/src/payments/payments.service.ts`

**Find and delete all mock URL generation:**

```typescript
// DELETE
return `https://mock-s3-bucket.s3.amazonaws.com/projects/${id}/cover.jpg`;
// DELETE
return `https://mock-s3-bucket.s3.amazonaws.com/invoices/${invoiceId}.pdf`;
// DELETE
const uploadUrl = `https://mock-s3-bucket.s3.amazonaws.com/uploads/${filename}`;
```

**Install Cloudinary SDK in the API:**

```bash
pnpm --filter api add cloudinary
```

**Create:** `apps/api/src/file/cloudinary.provider.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export { cloudinary };
```

**Add startup check in `apps/api/src/main.ts`:**

```typescript
const requiredEnvVars = [
  'AUTH_SECRET',
  'DATABASE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

**In `project.service.ts`**, replace every mock URL with a real Cloudinary upload call:

```typescript
import { cloudinary } from '../file/cloudinary.provider';

async uploadProjectCover(projectId: string, fileBuffer: Buffer, mimeType: string) {
  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: `mdms/projects/${projectId}`, resource_type: 'image' },
        (err, result) => {
          if (err || !result) reject(err);
          else resolve(result);
        },
      )
      .end(fileBuffer);
  });

  await this.prisma.project.update({
    where: { id: projectId },
    data:  { coverImage: uploadResult.secure_url },
  });

  return uploadResult.secure_url;
}
```

**Verification:**
- `grep -r "mock-s3-bucket\|mock_s3\|amazonaws.com.*mock" apps/api/src` → zero results.
- Upload a project cover image → URL in the DB starts with `https://res.cloudinary.com/`.

---

### Task 5.2 — Replace mock Razorpay orders with real API calls

**File to fix:** `apps/api/src/payments/payments.service.ts`

**Install Razorpay SDK:**

```bash
pnpm --filter api add razorpay
pnpm --filter api add -D @types/razorpay
```

**Find and delete entirely:**

```typescript
// DELETE — mock order generation
const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
return { orderId, amount, currency: 'INR' };

// DELETE — simulation method (entire method)
async simulateSuccessfulPayment(orderId: string) {
  // ...fake webhook simulation
}
```

**Replace with real Razorpay integration:**

```typescript
// apps/api/src/payments/payments.service.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService, private auditService: AuditService) {
    this.razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amountInPaise: number, currency = 'INR', receiptId: string) {
    const order = await this.razorpay.orders.create({
      amount:   amountInPaise,
      currency,
      receipt:  receiptId,
    });

    // Persist order in DB with status PENDING
    await this.prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount:          amountInPaise,
        currency,
        status:          'PENDING',
        receiptId,
      },
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  async verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
  ): Promise<boolean> {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');
    return expectedSignature === signature;
  }

  async handleWebhook(event: RazorpayWebhookEvent) {
    const { payload, event: eventType } = event;

    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity;
      await this.prisma.payment.update({
        where: { razorpayOrderId: payment.order_id },
        data:  {
          status:            'CAPTURED',
          razorpayPaymentId: payment.id,
          capturedAt:        new Date(),
        },
      });
      await this.auditService.log({
        actorId:    'RAZORPAY_WEBHOOK',
        action:     'PAYMENT_CAPTURED',
        entityType: 'Payment',
        entityId:   payment.order_id,
        meta:       { paymentId: payment.id, amount: payment.amount },
      });
    }

    if (eventType === 'payment.failed') {
      const payment = payload.payment.entity;
      await this.prisma.payment.update({
        where: { razorpayOrderId: payment.order_id },
        data:  { status: 'FAILED' },
      });
    }
  }
}
```

**Webhook controller — verify signature before processing:**

```typescript
@Post('webhook/razorpay')
@Public()
async razorpayWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('x-razorpay-signature') signature: string,
) {
  const isValid = await this.paymentsService.verifyWebhookSignature(
    req.rawBody,
    signature,
  );
  if (!isValid) throw new UnauthorizedException('Invalid webhook signature');

  await this.paymentsService.handleWebhook(req.body);
  return { received: true };
}
```

Make sure `main.ts` enables raw body for the webhook route:

```typescript
app.use('/api/v1/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
```

**Verification:**
- `grep -r "mock_order_\|simulateSuccessfulPayment\|simulat.*payment\|fake.*webhook" apps/api/src` → zero results.
- Create an order in Razorpay test mode → real order ID returned (starts with `order_`).
- Payment webhook arrives with valid signature → payment status updated in DB.
- Payment webhook with invalid signature → `401 Unauthorized`.

---

## Section 6 — CMS & Static Content

### Task 6.1 — Remove static search preview items from 3D navbar

**File to fix:** `apps/web/components/3d-interactive-navbar.tsx`

**Find and delete:**

```typescript
// DELETE
const componentItems = [
  { title: 'Brand Campaign',   image: '/mock/campaign.jpg',   href: '/...' },
  { title: 'Music Video',      image: '/mock/music.jpg',      href: '/...' },
  // ...
];
```

**Replace with a real API call on search input change (client-side):**

```typescript
'use client';
import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

function NavbarSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useDebouncedCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  return (
    <div>
      <input onChange={e => search(e.target.value)} placeholder="Search..." />
      {isLoading && <Spinner />}
      {results.map(r => (
        <a key={r.id} href={r.href}>{r.title}</a>
      ))}
      {!isLoading && results.length === 0 && <p>No results</p>}
    </div>
  );
}
```

Create a backend search endpoint or a Next.js API route that queries
blog posts, portfolio items, and talent profiles by title/name.

**Verification:**
- `grep -r "componentItems\|/mock/campaign\|/mock/music\|history.*preview\|searchHistory.*mock" apps/web/components/3d-interactive-navbar` → zero results.
- Searching for a keyword → results come from the database, not a static array.
- Empty search → no results shown (not a static list).

---

### Task 6.2 — Remove static blog posts and testimonials

**Files to fix:**
- `apps/web/app/(public)/blog/[slug]/page.tsx`
- `apps/web/app/(public)/testimonials/page.tsx`

**Find and delete all hardcoded post or testimonial arrays in these files.**

They will look like:

```typescript
// DELETE
const MOCK_BLOG_POSTS = [
  { slug: 'behind-the-lens', title: 'Behind the Lens', content: '...', author: 'Admin', date: '...' },
  // ...
];

// DELETE
const MOCK_TESTIMONIALS = [
  { id: '1', clientName: 'Riya S.', content: 'Amazing work!', rating: 5 },
  // ...
];
```

Replace with real fetches from the CMS API (these endpoints already exist from
the backend work and are `@Public()`):

```typescript
// apps/web/app/(public)/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cms/blog/${params.slug}`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('Failed to load post');
  const post = await res.json();
  return <BlogPostView post={post} />;
}

// Generate static paths from published posts
export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/blog?limit=100`);
  const { data: posts } = await res.json();
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}
```

```typescript
// apps/web/app/(public)/testimonials/page.tsx
export default async function TestimonialsPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cms/testimonials`,
    { next: { revalidate: 300 } },
  );
  const testimonials = res.ok ? await res.json() : [];
  return (
    <div>
      {testimonials.length === 0
        ? <p className="text-center py-20 text-muted">No testimonials yet.</p>
        : testimonials.map((t: Testimonial) => <TestimonialCard key={t.id} testimonial={t} />)
      }
    </div>
  );
}
```

**Verification:**
- `grep -r "MOCK_BLOG_POSTS\|MOCK_TESTIMONIALS\|Amazing work\|Behind the Lens.*mock" apps/web/app/(public)" .` → zero results.
- `/blog/[real-slug]` renders a real blog post from the CMS.
- `/blog/nonexistent-slug` → 404 page.
- `/testimonials` renders testimonials from the DB, or a clean empty message.

---

## Section 7 — Database Seed (Clean Production Seed)

### Task 7.1 — Replace mock seed with production-ready minimal seed

**File to fix:** `apps/api/prisma/seed.ts`

The current seed populates tables with mock data (fake projects, fake testimonials,
fake team members, fake blog posts). This is wrong for production.

**Replace the entire seed file with a minimal, idempotent production seed:**

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Running production seed...');

  // 1. Create the initial SUPER_ADMIN account
  //    Uses env vars — NEVER hardcode credentials here
  const superAdminEmail    = process.env.SEED_SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      'Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env before seeding.',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
    await prisma.user.create({
      data: {
        email:          superAdminEmail,
        name:           'Super Admin',
        role:           Role.SUPER_ADMIN,
        password:       hashedPassword,
        isActive:       true,
        emailVerified:  true,
      },
    });
    console.log(`Created SUPER_ADMIN: ${superAdminEmail}`);
  } else {
    console.log(`SUPER_ADMIN already exists: ${superAdminEmail}`);
  }

  // 2. Seed default SystemConfig keys (empty/placeholder values)
  //    Real content is entered via the admin CMS UI — not hardcoded here
  const defaultConfigs = [
    { key: 'hero',    value: JSON.stringify({ heading: '', subheading: '', ctaText: '', ctaUrl: '' }) },
    { key: 'navbar',  value: JSON.stringify({ logo: '', links: [] }) },
    { key: 'footer',  value: JSON.stringify({ companyName: '', socialLinks: [] }) },
    { key: 'seo',     value: JSON.stringify({ defaultTitle: '', defaultDescription: '' }) },
    { key: 'stats',   value: JSON.stringify([]) },
    { key: 'pricing', value: JSON.stringify([]) },
  ];

  for (const config of defaultConfigs) {
    await prisma.systemConfig.upsert({
      where:  { key: config.key },
      update: {},               // do not overwrite existing config
      create: { key: config.key, value: config.value },
    });
  }

  console.log('Seeded default SystemConfig keys.');
  console.log('Seed complete. All content must be added through the admin CMS.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

Add to `apps/api/.env.example`:

```env
# Seed credentials — only used during `pnpm prisma db seed`
SEED_SUPER_ADMIN_EMAIL=admin@yourdomain.com
SEED_SUPER_ADMIN_PASSWORD=
```

**Verification:**
- `pnpm prisma db seed` runs without errors.
- Only one user is created (SUPER_ADMIN). No fake projects, testimonials, team members, or blog posts.
- `SystemConfig` has the 6 default keys with empty/default values.
- Running `pnpm prisma db seed` a second time does not duplicate any records (idempotent).
- `grep -r "mock\|fake\|placeholder\|dummy\|Lorem ipsum" apps/api/prisma/seed.ts` → zero results.

---

## Final Sweep — Zero Tolerance Check

Run every one of these `grep` checks. **Every single one must return zero results.**
If any returns results, do not proceed — go back and fix it.

```bash
# Auth bypasses
grep -r "MOCK_USERS"            apps/ --include="*.ts" --include="*.tsx"
grep -r "x-mock-user-id"        apps/ --include="*.ts" --include="*.tsx"
grep -r "mock-talent-user"      apps/ --include="*.ts" --include="*.tsx"
grep -r "FALLBACK_TALENT"       apps/ --include="*.ts" --include="*.tsx"
grep -r "Demo Talent"           apps/ --include="*.ts" --include="*.tsx"

# Hardcoded payment mocks
grep -r "mock_order_"           apps/ --include="*.ts" --include="*.tsx"
grep -r "simulateSuccessfulPay" apps/ --include="*.ts" --include="*.tsx"
grep -r "simulat.*payment"      apps/ --include="*.ts" --include="*.tsx"

# Hardcoded storage URLs
grep -r "mock-s3-bucket"        apps/ --include="*.ts" --include="*.tsx"
grep -r "amazonaws.com/mock"    apps/ --include="*.ts" --include="*.tsx"

# Hardcoded content arrays
grep -r "MOCK_PROFILES"         apps/ --include="*.ts" --include="*.tsx"
grep -r "MOCK_SLUGS"            apps/ --include="*.ts" --include="*.tsx"
grep -r "MOCK_PRODUCTS"         apps/ --include="*.ts" --include="*.tsx"
grep -r "MOCK_CASTING"          apps/ --include="*.ts" --include="*.tsx"
grep -r "MOCK_BLOG"             apps/ --include="*.ts" --include="*.tsx"
grep -r "MOCK_TESTIMONIALS"     apps/ --include="*.ts" --include="*.tsx"
grep -r "Elena Rostova"         apps/ --include="*.ts" --include="*.tsx"
grep -r "Marcus Chen"           apps/ --include="*.ts" --include="*.tsx"
grep -r "Sample Brand Campaign" apps/ --include="*.ts" --include="*.tsx"
grep -r "Summer Fashion Campaign" apps/ --include="*.ts" --include="*.tsx"
grep -r "Neon Silk Campaign"    apps/ --include="*.ts" --include="*.tsx"
grep -r "Midnight Anthem"       apps/ --include="*.ts" --include="*.tsx"

# Fake upload simulation
grep -r "Mock Action"           apps/ --include="*.ts" --include="*.tsx"
grep -r "setInterval.*progress" apps/ --include="*.ts" --include="*.tsx"
grep -ri "simulate.*upload"     apps/ --include="*.ts" --include="*.tsx"

# Unsplash placeholder images
grep -r "unsplash.com"          apps/ --include="*.ts" --include="*.tsx"

# Seed file mock content
grep -ri "lorem ipsum"          apps/api/prisma/
grep -r  "placeholder bio"      apps/api/prisma/
```

---

## End-to-End Smoke Test (Production Readiness)

Run this sequence on the fully cleaned codebase:

### Auth
1. Open the site without being logged in. Navigate to `/super-admin`. Confirm redirect to `/login`.
2. Log in with the seeded SUPER_ADMIN credentials. Confirm landing on `/super-admin`. No mock user referenced.
3. Log out. Confirm session cleared.

### Registration
4. Register a new CLIENT account via the UI. Confirm the user appears in the `User` table in PostgreSQL. Confirm no in-memory array was touched.

### Content
5. As SUPER_ADMIN, open the CMS and create a new blog post. Publish it.
6. Visit the public `/blog` page. Confirm the new post appears and no static mock posts are shown.
7. Create a testimonial via the CMS. Visit `/testimonials`. Confirm real testimonial renders.
8. If no content is in the DB: visit `/blog`, `/testimonials`, `/portfolio`. Confirm clean empty states, no crashes, no mock data.

### Talent
9. Create a talent user and a talent profile via the admin panel. Visit `/talent/[slug]`. Confirm real profile loads.
10. Visit `/talent/nonexistent`. Confirm 404.

### Uploads
11. As an EDITOR, open a project workspace and upload a video file.
12. Confirm a real progress bar appears (not a simulated setTimeout one).
13. After upload, confirm the `Version` record in DB has a `videoUrl` starting with `https://res.cloudinary.com/`.

### Payments
14. Initiate a booking payment flow. Confirm a real Razorpay order ID is returned (starts with `order_`, not `mock_order_`).
15. Use Razorpay's test card to complete payment. Confirm the payment webhook updates the DB status to `CAPTURED`.

### Zero mock data in DB
16. After all of the above, check these tables in the database:
    - `User`: only real registered users. No hardcoded super admin with email `admin@example.com`.
    - `BlogPost`: only posts created through the CMS.
    - `Testimonial`: only testimonials created through the CMS.
    - `Project`: only projects created through the admin panel.
    - `MediaAsset`: only files uploaded through the app.
    - `Payment`: only real Razorpay orders.

---

## What Clean Looks Like

| Area | Before (broken) | After (production-ready) |
|---|---|---|
| Auth | MOCK_USERS array with 4 hardcoded accounts | Only real DB users, JWT auth |
| Registration | Pushes to in-memory array | Persists to PostgreSQL via API |
| Auth bypass | x-mock-user-id header skips JWT | No bypass exists, JWT always enforced |
| Talent profiles | Hardcoded slug→image map | Database fetch, 404 on missing |
| Featured talent | 4 static names with Unsplash URLs | `isFeatured: true` query from DB |
| Portfolio scroll | MOCK_PRODUCTS array | Real portfolio items from CMS |
| Casting board | Hardcoded 'Summer Fashion Campaign' | Real bookings from DB for session user |
| Talent dashboard | FALLBACK_TALENT_PROFILE on auth fail | Auth failure → redirect to login |
| File upload | setTimeout simulation, alert() | Real XHR to Cloudinary via backend |
| Editor workspace | MockEditorWorkspace component | Real project fetch, 403/404 on miss |
| S3 URLs | mock-s3-bucket.s3.amazonaws.com | res.cloudinary.com/[your-cloud] |
| Razorpay | mock_order_ IDs, simulateSuccessfulPayment | Real Razorpay SDK, real webhook |
| Blog page | MOCK_BLOG_POSTS array in component | CMS API fetch, generateStaticParams |
| Testimonials | MOCK_TESTIMONIALS array in component | CMS API fetch |
| Navbar search | Static componentItems array | Debounced API search |
| DB seed | Dozens of fake projects, posts, testimonials | Only SUPER_ADMIN user + empty config keys |
