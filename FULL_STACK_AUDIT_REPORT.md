# Phase 0 — Full-Stack Codebase Audit Report
**Project:** MP Production (Media & Digital Management System)  
**Date:** July 2026  
**Audit Scope:** Public Frontend Pages, Admin Panel UI/Features, Backend API & Database Schema.

---

## 1. Frontend Audit (`apps/web/src/app/*`)

### Overview of Public Pages & Routes
| Page / Route | Displayed Data | Current Source | Status / Missing Integration |
|---|---|---|---|
| `/` (Home Page: `page.tsx`) | Hero (Titles, CTA, Images), Counters/Stats (`useCountUp`), Services Cards (`SERVICES`), Featured Projects (`PROJECTS`), Featured Talent (`TALENT`), Process Steps (`PROCESS`), Testimonials (`TESTIMONIALS`), FAQ (`FAQ`), Contact CTA (`ContactCta`) | **100% Hardcoded / Static Arrays** (`const SERVICES`, `const PROJECTS`, etc.) | **Unwired.** Must fetch `hero`, `stats`, `services`, `portfolio`, `team/talent`, `testimonials`, `faq` dynamically from API. |
| `/about` | Company Story, Mission/Vision, Core Values, Team Members (`TEAM_MEMBERS`), Milestones / Stats | Hardcoded constants in `about/page.tsx` | **Unwired.** Must wire Team Members (`/api/v1/cms/team`) and Stats (`/api/v1/cms/stats`). |
| `/services` | Service Categories, Details, Features Lists, Pricing/Booking CTA | Hardcoded `SERVICES_DATA` in `services/page.tsx` | **Unwired.** Must wire Services (`/api/v1/services` or `/api/v1/cms/services`). |
| `/portfolio` | Grid of video/photo projects, category filters, modal viewer | Hardcoded `PORTFOLIO_ITEMS` / `mockData` | **Unwired.** Must wire Portfolio (`/api/v1/cms/portfolio`). |
| `/projects` | Ongoing / showcased projects listing | Hardcoded arrays / static layout | **Unwired.** Must wire Projects / Portfolio API. |
| `/talent` | Roster of models, actors, creators, search & filter sidebar | Hardcoded `TALENT_ROSTER` array / partial API check | **Partial / Unwired.** Must wire to `TalentProfile` real DB records (`/api/v1/talent`). |
| `/pricing` | Production packages, rate cards, feature comparisons, FAQs | Hardcoded `PRICING_PLANS` & `PRICING_FAQ` | **Unwired.** Must wire Pricing (`/api/v1/cms/pricing`) and FAQ (`/api/v1/cms/faq`). |
| `/faq` | Categorized frequently asked questions (`FAQ_ITEMS`) | Hardcoded array in `faq/page.tsx` | **Unwired.** Must wire FAQ (`/api/v1/cms/faq`). |
| `/contact` | Contact form (Name, Email, Phone, Subject, Message), Office Locations | Hardcoded layout; Form submit (`onSubmit`) does local state / console or no-op | **Unwired.** Must wire Contact form submission to `POST /api/v1/contact` + email notification. |
| `/blog` & `/blog/[slug]` | Blog post listings, categories, single post article view | Hardcoded `BLOG_POSTS` / static articles | **Unwired.** Must wire Blog (`/api/v1/cms/blog`). |
| `Navbar` (`components/ui/Navbar.tsx`) | Logo, Nav Links, CTA Button | Hardcoded links and labels | **Unwired.** Must wire to `GET /api/v1/navigation` (global config). |
| `HoverFooter` (`components/ui/hover-footer.tsx`) | Footer columns, links, social URLs, copyright text | Hardcoded strings and `#` links | **Unwired.** Must wire to `GET /api/v1/footer` and social links config. |

### Component Analysis & Interactive Dead Ends
- **Static Arrays Identified:** `SERVICES`, `PROJECTS`, `TALENT`, `TESTIMONIALS`, `PROCESS`, `FAQ` in `page.tsx`; similar constants in `/about`, `/services`, `/portfolio`, `/pricing`, `/faq`, `/blog`.
- **Dead/Unwired Buttons & Links:**
  - Contact Form submit button (currently client-only validation/mock submission).
  - Newsletter Signup inputs (in footer/CTA sections).
  - Social share links (`#` or static icons).
  - Dynamic CTA buttons across Hero and Services sections (hardcoded `href="/contact"` or `href="/join"` without dynamic CMS control).

---

## 2. Admin Panel Audit (`apps/web/src/app/admin/*` & `super-admin/*`)

### Current State of Admin Dashboard
Both `/admin/page.tsx` and `/super-admin/page.tsx` currently render a rich, fully functional UI powered **entirely by client-side React `useState` arrays**:
- `const [kpis, setKpis] = useState(...)` -> Hardcoded strings (`$485,000`, `142 talent`, etc.).
- `const [bookings, setBookings] = useState(...)` -> 4 static mock bookings (`bk-01` to `bk-04`).
- `const [cmsItems, setCmsItems] = useState(...)` -> 6 static mock items (`p-01`, `b-01`, `t-01`).
- `const [talentReviews, setTalentReviews] = useState(...)` -> 3 static review items (`t-rev-1` to `t-rev-3`).

### Missing Backend Integrations in Admin Panel
| Admin Section / Feature | Existing UI State | Missing Backend API & Wiring |
|---|---|---|
| **KPIs / Overview Stats** | Shows static `kpis` object | Wire to real aggregated stats API (`GET /api/v1/admin/stats`). |
| **CMS Manager (Portfolio, Blog, Testimonials, Team)** | Modal form (`openAddModal`, `openEditModal`) updates local `cmsItems` state in memory | Wire to real CRUD endpoints (`POST/PATCH/DELETE /api/v1/cms/portfolio`, `/blog`, `/testimonials`, `/team`). |
| **Bookings Manager** | Status dropdown changes local state in memory | Wire to `PATCH /api/v1/bookings/:id/status`. |
| **Talent Review Queue** | Approve/Reject buttons update local state in memory | Wire to `PATCH /api/v1/talent/:id/review` (`APPROVED` / `REJECTED`). |
| **Navigation Editor** | Missing dedicated management UI or hardcoded | Add/wire Navigation links manager (`GET/POST/PATCH/DELETE /api/v1/navigation`). |
| **Footer Editor** | Missing dedicated management UI or hardcoded | Add/wire Footer manager (`GET/POST/PATCH/DELETE /api/v1/footer`). |
| **Hero Editor** | Missing dedicated management UI or hardcoded | Add/wire per-page Hero configuration (`GET/PATCH /api/v1/hero`). |
| **Media Library / Uploads** | `MediaUploaders.tsx` exists for talent profile onboarding | Expand/integrate general file uploader to Cloudinary/S3 (`POST /api/v1/files/upload`). |
| **Recycle Bin & Soft Delete** | Missing or hard delete only | Implement `deletedAt` filtering, soft deletes, and a Recycle Bin view in admin. |
| **Audit Logs** | Prisma model `AuditLog` exists; missing admin UI table/viewer | Wire/create `GET /api/v1/admin/audit-logs` and admin log table. |

---

## 3. Backend API Audit (`apps/api/src/*`) & Prisma Schema Check

### Existing Database Models (`prisma/schema.prisma`)
- `User`, `Client`, `Employee`, `TalentProfile` (with full relations & JSON attributes).
- `Booking`, `Project`, `Payment`, `Invoice`, `Milestone`, `Task`, `Version`, `Comment`, `Message`.
- **CMS Models Existing:**
  - `BlogPost` (title, slug, excerpt, content, coverImageUrl, status, publishedAt)
  - `PortfolioItem` (title, slug, description, category, mediaType, mediaUrl, thumbnailUrl, isPublished, sortOrder)
  - `Testimonial` (clientName, clientTitle, clientCompany, clientPhoto, content, rating, isPublished, sortOrder)
  - `TeamMember` (name, role, bio, photoUrl, socialLinks, isPublished, sortOrder)
  - `FaqItem` (question, answer, category, sortOrder, isPublished)
  - `SystemConfig` (key, value, type — can store navigation, footer, hero, banners, SEO settings)
  - `Service` (name, slug, description, shortDesc, category, basePrice, features, addOns, isActive, sortOrder)

### Existing vs. Required API Endpoints (`CmsController` & Services)
Currently, `CmsController` has endpoints for `portfolio`, `blog`, `testimonials`, and `team`.
We must expand/ensure completeness for all required entities:
1. `GET/POST/PATCH/DELETE /api/v1/cms/portfolio` (+ `/reorder`)
2. `GET/POST/PATCH/DELETE /api/v1/cms/blog`
3. `GET/POST/PATCH/DELETE /api/v1/cms/testimonials` (+ `/reorder`)
4. `GET/POST/PATCH/DELETE /api/v1/cms/team` (+ `/reorder`)
5. `GET/POST/PATCH/DELETE /api/v1/cms/faq` (+ `/reorder`)
6. `GET/POST/PATCH/DELETE /api/v1/cms/services` (+ `/reorder`)
7. `GET/POST/PATCH/DELETE /api/v1/cms/videos` (or `PortfolioItem` where `mediaType = "video"`)
8. `GET/POST/PATCH/DELETE /api/v1/cms/pricing` (or `Service` packages)
9. `GET/POST/PATCH /api/v1/cms/navigation` (stored via `SystemConfig`)
10. `GET/POST/PATCH /api/v1/cms/footer` (stored via `SystemConfig`)
11. `GET/POST/PATCH /api/v1/cms/hero` (stored via `SystemConfig`)
12. `GET/POST/PATCH/DELETE /api/v1/cms/banners` (or `Announcement` stored via `SystemConfig`)
13. `GET/POST/PATCH /api/v1/cms/seo` (stored via `SystemConfig`)
14. `POST /api/v1/contact` (store contact submissions in DB + trigger email)
15. `POST /api/v1/newsletter` (store subscriber + confirmation)
16. `GET /api/v1/admin/stats` (real KPIs calculation)

---

## 4. Execution Plan Summary
1. **Phase 1 (Cleanup):** Remove hardcoded static arrays from public pages (`page.tsx`, `/about`, `/services`, `/portfolio`, `/pricing`, `/faq`, `/contact`, `/blog`) and admin pages, replacing them with dynamic API data fetching (`useEffect` / SWR / fetch) while showing UI loading skeletons.
2. **Phase 2 (Backend Build):** Build and enhance all missing CMS endpoints, add soft delete support (`deletedAt`), reorder (`PATCH /reorder`), contact/newsletter submission endpoints, and real KPI aggregations in NestJS (`apps/api`).
3. **Phase 3 (Frontend Wiring):** Connect every section of `page.tsx` and all inner pages (`Navbar`, `Footer`, `Hero`, `Services`, `Portfolio`, `Testimonials`, `Team`, `FAQ`, `Pricing`, `Contact`, `Blog`) directly to the backend endpoints.
4. **Phase 4 (Admin Panel Wiring):** Wire all forms, tables, modals, toggles, status changes, and deletion flows in `/admin/page.tsx` and `/super-admin/page.tsx` to the backend endpoints with proper optimistic updates, loading states, and toast notifications.
5. **Phase 5 (Live Cache & Revalidation):** Ensure immediate reflection of admin edits on the live site without requiring redeployment.
6. **Phase 6 & 7 (Responsiveness & Security):** Conduct comprehensive responsive checks across all breakpoints and verify strict JWT auth/role guards across all write endpoints.
