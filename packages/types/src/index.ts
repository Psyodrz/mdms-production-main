/**
 * MDMS — Shared Type Definitions
 * ================================
 * Central types used across frontend and backend.
 * Mirrors Prisma enums and API response shapes.
 */

// ── Enums (mirror Prisma schema) ────────────────

export enum Role {
  GUEST = 'GUEST',
  CLIENT = 'CLIENT',
  TALENT = 'TALENT',
  EDITOR = 'EDITOR',
  EMPLOYEE = 'EMPLOYEE',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}



export enum BookingStatus {
  INQUIRY = 'INQUIRY',
  QUOTE_SENT = 'QUOTE_SENT',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ProjectStatus {
  BOOKED = 'BOOKED',
  PRE_PRODUCTION = 'PRE_PRODUCTION',
  SHOOT = 'SHOOT',
  EDITING = 'EDITING',
  REVIEW = 'REVIEW',
  REVISION = 'REVISION',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentType {
  ADVANCE = 'ADVANCE',
  FULL = 'FULL',
  MILESTONE = 'MILESTONE',
  REFUND = 'REFUND',
}

export enum VersionStatus {
  UPLOADED = 'UPLOADED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum CastingApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  NOT_SELECTED = 'NOT_SELECTED',
}

export enum HireRequestStatus {
  NEW = 'NEW',
  IN_DISCUSSION = 'IN_DISCUSSION',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export enum TalentProfileStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum TalentAvailability {
  FULL_TIME = 'FULL_TIME',
  WEEKENDS_ONLY = 'WEEKENDS_ONLY',
  FLEXIBLE = 'FLEXIBLE',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

export enum ExpenseStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RenderJobStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum CastingCallStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  ARCHIVED = 'ARCHIVED',
}

// ── API Response Types ──────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Auth Types ──────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;       // user ID
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password?: string;
  otp?: string;
  totpCode?: string;
}

// ── Booking Types ───────────────────────────────

export interface AvailabilityQuery {
  serviceId: string;
  date: string;        // ISO date
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CreateBookingRequest {
  serviceId: string;
  date: string;
  startTime: string;
  projectBrief: string;
  addOns?: string[];
  specialRequirements?: string;
}

// ── Payment Types ───────────────────────────────

export interface CreateOrderRequest {
  projectId: string;
  paymentType: PaymentType;
  amount?: number;      // in paise, for milestone payments
}

export interface RazorpayOrder {
  id: string;
  amount: number;       // paise
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ── Talent Types ────────────────────────────────

export interface TalentRegistrationRequest {
  fullName: string;
  age: number;
  gender: string;
  city: string;
  phone: string;
  email: string;
  categoryIds: string[];
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  bio: string;
  skills: string[];
  availability: {
    travelReady: boolean;
    freelancer: boolean;
    availableFullTime: boolean;
  };
}

export interface TalentSearchFilters {
  query?: string;
  categoryIds?: string[];
  city?: string;
  followerRange?: { min: number; max: number };
  availableFullTime?: boolean;
  sortBy?: 'followers' | 'newest' | 'most_booked' | 'alphabetical';
}

export interface HireRequestInput {
  talentId: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  projectType: string;
  city: string;
  dateNeeded?: string;
  budgetRange?: string;
  briefDescription: string;
}

// ── WhatsApp Types ──────────────────────────────

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components: WhatsAppComponent[];
}

export interface WhatsAppComponent {
  type: 'header' | 'body' | 'button';
  parameters: WhatsAppParameter[];
}

export interface WhatsAppParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
}

// ── File Upload Types ───────────────────────────

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  projectId?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: string;
}

export * from './permissions';
