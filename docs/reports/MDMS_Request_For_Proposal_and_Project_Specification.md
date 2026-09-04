# 📋 Request for Proposal (RFP) & System Specification

**Project Title:** Media & Digital Management System (MDMS) — Enterprise Platform Development  
**Issuing Organization:** MP Productions Management  
**Document Version:** 1.0  
**Target Delivery Date:** August 2026  
**Status:** **APPROVED PROPOSAL & TECHNICAL SPECIFICATION**  

---

## 1. Executive Summary & Purpose

MP Productions is a premier digital media agency, masterclass provider, and talent directory platform. To streamline agency operations, digital course sales, client deliverables, editor workflows, and talent management, MP Productions issued this **Request for Proposal (RFP) & Technical Specification**.

This document outlines the business context, functional requirements, technical architecture, non-functional performance benchmarks, and delivery acceptance criteria for the **Media & Digital Management System (MDMS)**.

---

## 2. Project Background & Business Objectives

### 2.1 Problem Statement
Previously, MP Productions relied on fragmented third-party tools for course checkout, manual WhatsApp billing verification, unorganized Google Drive video delivery, manual user database maintenance, and unstructured email-based editor feedback loops.

### 2.2 Core Objectives
1. **Unified Enterprise Portal:** Build a single integrated Monorepo platform housing Public Storefront, Student Academy, Client Portal, Editor Workbench, Talent Directory, and Super Admin Management.
2. **Instant Frictionless Monetization:** Provide dynamic UPI QR code payments with 12-digit UTR validation and automated 256-bit cryptographic course access token issuance.
3. **High-Capacity Asset Pipeline:** Support high-definition video trailer uploads up to 250MB directly synchronized to cloud storage.
4. **Automated User Administration:** Enable Super Admins to bulk-import hundreds of users via Excel/CSV drag-and-drop parsing.
5. **Strict RBAC & Security Isolation:** Enforce uppercase 8-tier Role-Based Access Control across all Next.js web routes and NestJS API endpoints.

---

## 3. Scope of Work (SOW) & Architecture

### 3.1 Platform Architecture Overview
The platform is developed as a modern Turborepo monorepo:
* **Frontend Application (`apps/web`):** Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion.
* **Backend API Gateway (`apps/api`):** NestJS REST API, TypeScript, Class-Validator, RxJS.
* **Database Layer:** PostgreSQL hosted on Supabase with Prisma ORM v6.9 connection pooling.
* **Caching & Real-time:** Redis v7 for session cache and rate-limiting; Supabase Realtime Channels.
* **Storage Infrastructure:** AWS S3 / Cloudflare R2 / Supabase Storage (`mp-cms`, `mp-public`).

```
                              +---------------------------------------+
                              |         MP Productions MDMS           |
                              +---------------------------------------+
                                                 |
         +--------------------+------------------+-------------------+--------------------+
         |                    |                  |                   |                    |
+------------------+ +------------------+ +----------------+ +------------------+ +------------------+
| Public Storefront| | Payment & Checkout| | Creator Lab    | | Client Portal    | | Super Admin &    |
| & Masterclasses  | | (UPI UTR + Auth) | | Student Portal | | & Deliverables   | | Bulk Excel Import|
+------------------+ +------------------+ +----------------+ +------------------+ +------------------+
```

---

## 4. Detailed Module Functional Requirements

### 4.1 Module 1: Public Storefront & Masterclass Academy
* **Requirements:**
  - Modern, mobile-responsive UI built with custom typography (`Outfit` & `Cormorant Garamond`).
  - Landing pages for specialized creator tracks (`/become-a-youtuber`, `/become-a-reeler`, `/become-a-creator`, `/become-an-influencer`).
  - High-performance GPU smooth scrolling (`scroll-behavior: smooth`) maintaining 60–120 FPS.
  - WhatsApp instant contact integration.

### 4.2 Module 2: Real-Time Payment Engine (`/checkout`)
* **Requirements:**
  - Dynamic UPI QR Code rendering (`upi://pay?pa=mpproduction@okicici&...`).
  - 1-Click Copy UPI ID button.
  - **12-Digit UTR Validation:** Input field requiring strict 12-digit numeric UPI reference numbers.
  - Coupon Code Engine (`CREATOR50` for 50% discount).
  - Automated 256-bit HMAC SHA-256 token generator (`issuePaymentProofToken`).

### 4.3 Module 3: Creator Lab Student Portal (`/creator-lab`)
* **Requirements:**
  - 4K video lesson playback player.
  - Module progress saving.
  - Student resource downloads (LUT packs, PSD templates, script guides).
  - Cryptographic access validation (`verifyCourseAccess256`) blocking unauthorized deep links.

### 4.4 Module 4: Super Admin Directory & Excel Import Engine (`/super-admin/users`)
* **Requirements:**
  - Paginated user list with real-time text search and role filtering.
  - **Excel / CSV Bulk Import Component (`UserImportModal.tsx`):**
    - Drag-and-drop file upload zone for `.xlsx`, `.xls`, and `.csv`.
    - Auto-header recognition (`Email`, `First Name`, `Last Name`, `Role`, `Password`).
    - Pre-import validation table displaying valid vs invalid rows.
    - Downloadable sample CSV file.
    - Batch database upsert with bcrypt password hashing.

### 4.5 Module 5: CMS Engine & High-Capacity Media Storage (`/super-admin/cms`)
* **Requirements:**
  - Full CRUD forms for Blog Posts, Portfolio, Team, Testimonials, Announcements, Courses, and Sales Leads.
  - **250MB Video Upload Buffer:** NestJS Multer configuration supporting media files up to 250MB.
  - Direct cloud S3/Supabase storage synchronization.
  - Soft delete and Recycle Bin recovery mechanism.

### 4.6 Module 6: Client Portal & Deliverables (`/client-portal`)
* **Requirements:**
  - Active project milestone progress view.
  - Secure deliverable downloads utilizing 72-hour pre-signed S3 links.
  - Casting call posting interface.

### 4.7 Module 7: Editor Portal & Versioning (`/editor-portal`)
* **Requirements:**
  - Strict project assignment isolation (editors view only assigned projects).
  - Draft upload management (`v1`, `v2`, `v3`).
  - Client feedback and timestamp comment thread.

### 4.8 Module 8: Talent Directory & Moderation (`/talent`)
* **Requirements:**
  - Public talent search with category filters (Actors, Models, Voice Artists, Influencers).
  - Talent profile registration with portfolio media galleries.
  - Super Admin profile moderation queue.

---

## 5. Non-Functional & Security Requirements

1. **Role-Based Access Control (RBAC):** Must strictly enforce uppercase `Role` enum values (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `EMPLOYEE`, `EDITOR`, `TALENT`, `CLIENT`, `GUEST`).
2. **Global API Guards:** NestJS backend must register `JwtAuthGuard` and `RolesGuard` globally via `APP_GUARD`.
3. **UI Responsiveness:** 100% compliant across mobile, tablet, desktop, and 4K displays.
4. **Performance:** Under 1.5s initial page load time; 60–120 FPS UI animation rendering.
5. **Data Protection:** Zero plain-text credentials, passwords, or tokens in server logs. Missing `AUTH_SECRET` must trigger safe application termination.

---

## 6. Project Deliverables & Acceptance Criteria

| Deliverable | Acceptance Criteria | Status |
| :--- | :--- | :--- |
| **Monorepo Codebase** | Full source code pushed to `Psyodrz/mdms-production-main` | ✅ Accepted |
| **Database Schema** | Prisma migrations applied with relational integrity | ✅ Accepted |
| **API Endpoint Suite** | NestJS controllers validated with `class-validator` | ✅ Accepted |
| **Excel Import System** | Functional drag-and-drop parser with error preview | ✅ Accepted |
| **250MB Media Uploads** | Clean S3/Supabase upload without URL dropouts | ✅ Accepted |
| **Documentation Package**| Test report, technical architecture, and deployment guide | ✅ Accepted |

---

## 7. Commercial Terms & Maintenance SLA

* **Warranty Period:** 90 Days post go-live for bug fixes and security patching.
* **Service Level Agreement (SLA):** 99.9% uptime target on cloud hosting.
* **Maintenance & Support:** Critical vulnerability turnaround within 4 hours; standard patch turnaround within 24 hours.

---
*Document approved by Board of Directors — MP Productions.*
