import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { BlogPostStatus } from '@mdms/types';

/**
 * CMS write DTOs.
 *
 * The global ValidationPipe (main.ts) runs with `whitelist` +
 * `forbidNonWhitelisted`, so any property NOT declared here is rejected.
 * These DTOs mirror the Prisma content models: columns that are NOT NULL
 * without a default are required; everything else is optional.
 */

// ── Portfolio ──────────────────────────────────────────────
export class UpsertPortfolioDto {
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() category!: string;
  @IsString() @IsNotEmpty() mediaUrl!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() year?: number;
  @IsOptional() @IsString() mediaType?: string;
  @IsOptional() @IsString() thumbnailUrl?: string;
  @IsOptional() @IsString() videoStreamId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── Blog ───────────────────────────────────────────────────
export class UpsertBlogDto {
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() content!: string;

  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsEnum(BlogPostStatus) status?: BlogPostStatus;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @Type(() => Date) @IsDate() publishedAt?: Date;
  @IsOptional() @Type(() => Date) @IsDate() scheduledAt?: Date;
}

// ── Testimonials ───────────────────────────────────────────
export class CreateTestimonialDto {
  @IsString() @IsNotEmpty() clientName!: string;
  @IsString() @IsNotEmpty() content!: string;

  @IsOptional() @IsString() clientTitle?: string;
  @IsOptional() @IsString() clientCompany?: string;
  @IsOptional() @IsString() clientPhoto?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsBoolean() isApproved?: boolean;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateTestimonialDto {
  @IsOptional() @IsString() @IsNotEmpty() clientName?: string;
  @IsOptional() @IsString() @IsNotEmpty() content?: string;
  @IsOptional() @IsString() clientTitle?: string;
  @IsOptional() @IsString() clientCompany?: string;
  @IsOptional() @IsString() clientPhoto?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsBoolean() isApproved?: boolean;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── Team ───────────────────────────────────────────────────
export class UpsertTeamDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() role!: string;

  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @Allow() socialLinks?: unknown;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── FAQ ────────────────────────────────────────────────────
export class UpsertFaqDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() question!: string;
  @IsString() @IsNotEmpty() answer!: string;

  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

// ── Services ───────────────────────────────────────────────
export class UpsertServiceDto {
  @IsString() @IsNotEmpty() slug!: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsString() @IsNotEmpty() category!: string;
  @IsInt() basePrice!: number;

  @IsOptional() @IsString() shortDesc?: string;
  @IsOptional() @Allow() features?: unknown;
  @IsOptional() @Allow() addOns?: unknown;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsInt() maxConcurrent?: number;
  @IsOptional() @IsInt() bufferMinutes?: number;
}

// ── Announcements ──────────────────────────────────────────
export class UpsertAnnouncementDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() text!: string;

  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

// ── Site Config (JSON key-value) ───────────────────────────
export class SetConfigDto {
  @IsDefined() value!: unknown;
  @IsOptional() @IsString() type?: string;
}

// ── Reorder ────────────────────────────────────────────────
export class ReorderItemDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsInt() sortOrder!: number;
}

export class ReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}

// ── Contact + Newsletter (public writes) ───────────────────
export class ContactSubmissionDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() message!: string;

  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() subject?: string;
}

export class NewsletterDto {
  @IsEmail() email!: string;
}

export class MarkContactReadDto {
  @IsOptional() @IsBoolean() isRead?: boolean;
}
