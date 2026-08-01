# MP Production — API Documentation

- **Base URL:** `${NEXT_PUBLIC_API_URL}` → `/api/v1` (global prefix).
- **Auth:** `Authorization: Bearer <Supabase access token>` unless marked `@Public`.
- **Guards:** `JwtAuthGuard` → `RolesGuard` (global). `@Roles(...)` gates by role; `@Public()` bypasses auth.
- **Response envelope:** every endpoint is wrapped by `ResponseInterceptor`:
  ```json
  { "success": true, "data": <payload>, "message": "optional" }
  ```
- **Errors:** `HttpExceptionFilter` returns:
  ```json
  { "success": false, "statusCode": 400, "message": "…", "path": "/api/v1/…", "timestamp": "ISO" }
  ```
  Validation errors (class-validator, `whitelist` + `forbidNonWhitelisted`) return **400** with a `message` array. Auth failures → **401**; role failures → **403**; missing entities → **404**.

Roles: `GUEST · CLIENT · TALENT · EDITOR · EMPLOYEE · PROJECT_MANAGER · ADMIN · SUPER_ADMIN`.

---

## Auth — `/auth`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (firstName, lastName, email, password, role). |
| POST | `/auth/login` | Public | Email/password → `{ accessToken, expiresIn, user }`. |
| POST | `/auth/otp/request` | Public | Request OTP (stored in Redis, 5-min TTL). ⚠️ delivery not yet wired. |
| POST | `/auth/otp/verify` | Public | Verify OTP. |

> Primary user auth is Supabase (client-side). The NestJS API validates Supabase JWTs.

## Health — `/health`
| GET | `/health` | Public | Liveness probe. |

## Talent Categories — `/talent-category` (Public)
| GET | `/talent-category` | Public | List categories + dynamic fields. |
| GET | `/talent-category/:slug` | Public | Category by slug. |

## Talent — `/talent`
| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/talent` | Public | Public directory (search/type/location). |
| GET | `/talent/featured` | Public | Featured talents. |
| GET | `/talent/:id` | Public | Public profile (id or slug). |
| POST | `/talent/:id/hire` | Public | Create hire request (`CreateHireRequestDto`). |
| GET | `/talent/pending` | ADMIN, SUPER_ADMIN | Pending profiles for moderation. |
| GET | `/talent/me` | TALENT, CLIENT, ADMIN, SUPER_ADMIN | Current talent profile. |
| PATCH | `/talent/me` | TALENT, CLIENT, ADMIN, SUPER_ADMIN | Update profile (preserves status). |
| PATCH | `/talent/hire-requests/:id` | TALENT, ADMIN, SUPER_ADMIN | Accept/decline/in-discussion (`RespondHireRequestDto`). |
| POST | `/talent/draft` | TALENT, CLIENT, ADMIN, SUPER_ADMIN | Save onboarding draft. |
| POST | `/talent/submit` | TALENT, CLIENT, ADMIN, SUPER_ADMIN | Submit profile → PENDING_REVIEW. |
| PATCH | `/talent/:id/moderate` | ADMIN, SUPER_ADMIN | Approve/reject (`{ status, reviewNote }`). |

## CMS — `/cms`
**Public reads:** `GET /cms/portfolio`, `/cms/portfolio/:slug`, `/cms/config/:key`, `/cms/preview/blog/:slug?token=`, plus public list endpoints for blog/testimonials/team/faq/services/casting-calls/courses (see controller).

**Admin (ADMIN, SUPER_ADMIN unless noted)** — DTOs validated (`cms.dto.ts`):
| Resource | List | Create/Upsert | Delete |
|---|---|---|---|
| Portfolio | `GET /cms/admin/portfolio` | `POST /cms/admin/portfolio` (`UpsertPortfolioDto`: slug,title,category,mediaUrl req) | `DELETE /cms/admin/portfolio/:id` |
| Blog | `GET /cms/admin/blog` | `POST /cms/admin/blog` (`UpsertBlogDto`: slug,title,content req) | `DELETE …/:id` |
| Testimonials | `GET …/testimonials` | `POST …/testimonials` (create) / `PATCH …/:id` (update) | `DELETE …/:id` |
| Team | `GET …/team` | `POST …/team` (`UpsertTeamDto`) | `DELETE …/:id` |
| FAQ / Services / Announcements | `GET …/{faq,services,announcements}` | `POST …` (respective DTOs) | `DELETE …/:id` |
| Config | — | `POST /cms/admin/config/:key` (`SetConfigDto: { value, type? }`) | — |
| Reorder | — | `PATCH /cms/admin/reorder/:model` | — |
| Recycle bin | `GET /cms/admin/recycle-bin` | `PATCH …/:modelType/:id/restore` | `DELETE …/:modelType/:id/permanent` |
| Courses | `GET …/courses` | `POST …/courses`, `POST …/courses/:id/lessons` | `DELETE …/:id` |
| Media | `GET …/media` | (upload via `/files/upload`) | `DELETE …/media/:id` |
| Casting calls, Talents, Bookings, Feature flags, Sales leads/targets, Referrals, Contacts, Newsletter, Students | see `cms.controller.ts` | `@Body() body: any` on several | `DELETE …/:id` |

## Admin — `/admin`
| Method | Path | Roles |
|---|---|---|
| GET | `/admin/users` | ADMIN, SUPER_ADMIN |
| POST | `/admin/users` | ADMIN, SUPER_ADMIN |
| POST | `/admin/users/bulk-import` | ADMIN, SUPER_ADMIN |
| PATCH | `/admin/users/:id/role` | ADMIN, SUPER_ADMIN (only SUPER_ADMIN may grant SUPER_ADMIN) |
| PATCH | `/admin/users/:id/deactivate` \| `/reactivate` | ADMIN, SUPER_ADMIN |
| POST | `/admin/users/:id/reset-mfa` | SUPER_ADMIN |
| GET | `/admin/dashboard/kpis`, `/stats`, `/dashboard/recent-bookings` | Public |
| GET | `/admin/audit-logs` | SUPER_ADMIN |
| GET | `/admin/projects`, `/admin/projects/:id` | ADMIN, SUPER_ADMIN, PROJECT_MANAGER |
| PATCH | `/admin/projects/:id/status` | ADMIN, SUPER_ADMIN |

## Audit — `/audit`
| GET | `/audit` | ADMIN, SUPER_ADMIN | Paginated audit log (filters: actorId, resource, page, limit). |

## Editor — `/editor`
| GET | `/editor/projects`, `/editor/projects/:projectId` | EDITOR, SUPER_ADMIN |
| POST | `/editor/projects/:projectId/render-jobs`, `/versions` | EDITOR, SUPER_ADMIN |
| PATCH | `/editor/render-jobs/:jobId/status` | EDITOR, SUPER_ADMIN |

## Employee — `/employee`
| GET | `/employee`, `/employee/:id` | ADMIN, SUPER_ADMIN |
| POST | `/employee/attendance/check-in` \| `check-out` | EMPLOYEE, EDITOR, PROJECT_MANAGER, ADMIN, SUPER_ADMIN |
| GET | `/employee/attendance/history` | (same) |
| POST | `/employee/leave`, `/employee/expense` | (same) |
| PATCH | `/employee/leave/:id/status`, `/employee/expense/:id/status` | ADMIN, SUPER_ADMIN |

## Client — `/client`
| GET | `/client/projects`, `/client/projects/:projectId` | CLIENT |
| POST | comment/version-approval endpoints | CLIENT (see controller) |

## Booking(s)
- `/booking` — `GET /booking` (my bookings: CLIENT, TALENT, ADMIN, SUPER_ADMIN, PROJECT_MANAGER); `PATCH /booking/:id/status` (ADMIN, SUPER_ADMIN, PROJECT_MANAGER).
- `/bookings/casting-calls` — `POST` (CLIENT, ADMIN, SUPER_ADMIN, PROJECT_MANAGER), `GET` (CLIENT, TALENT, ADMIN, SUPER_ADMIN).

## Files — `/files`
| POST | `/files/upload` | ADMIN, SUPER_ADMIN, EDITOR | multipart, ≤250 MB. |
| POST | `/files/editor/upload-url` | EDITOR, ADMIN, SUPER_ADMIN | Presigned URL. |
| POST | `/files/talent/upload-url` | TALENT | Presigned URL. |
| GET | `/files/download-url/:key` | CLIENT, ADMIN, SUPER_ADMIN | |
| GET | `/files/assets` | ADMIN, SUPER_ADMIN, EDITOR | Paginated. |
| DELETE | `/files/assets/:id` | ADMIN, SUPER_ADMIN | |

## Payments — `/payments`
| POST | `/payments/checkout/session` | CLIENT, ADMIN, SUPER_ADMIN |
| GET | `/payments/invoices` | CLIENT |
| POST | `/payments/webhook/razorpay` | Public (signature-verified) |

## System — `/system` (SUPER_ADMIN)
| GET/POST | `/system/flags` · `/system/configs` · `/system/working-hours` · `/system/blocked-dates` |
| DELETE | `/system/blocked-dates/:id` |

## Users — `/users` (ADMIN, SUPER_ADMIN)
| GET | `/users`, `/users/:id` · POST `/users` · PATCH `/users/:id`, `/:id/deactivate`, `/:id/activate` |

## WhatsApp — `/whatsapp`
| GET | `/whatsapp/status` (Public) · POST `/whatsapp/webhook`, `/whatsapp/inboxwa/webhook` (Public, provider-verified) |

---

### Role permission summary
| Area | GUEST | CLIENT | TALENT | EDITOR | EMPLOYEE | PROJECT_MANAGER | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|---|---|---|
| Public reads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Own dashboard | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects (read) | — | own | — | assigned | — | all | all | all |
| CMS admin | — | — | — | media only | — | — | ✅ | ✅ |
| User management | — | — | — | — | — | — | ✅ | ✅ |
| Grant SUPER_ADMIN / reset MFA / audit / system config | — | — | — | — | — | — | ❌ | ✅ |
