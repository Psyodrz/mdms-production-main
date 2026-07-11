import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength, IsUrl } from 'class-validator';
import { BlogPostStatus } from '@mdms/types';

export class UpsertBlogPostDto {
  @IsString() @MinLength(3) @MaxLength(200)
  title!: string;

  @IsString() @MinLength(3) @MaxLength(300)
  slug!: string;

  @IsString() @MaxLength(500)
  excerpt!: string;

  @IsString()
  content!: string; // HTML from TipTap

  @IsOptional() @IsUrl()
  coverImageUrl?: string; // Align with schema.prisma coverImageUrl

  @IsOptional() @IsEnum(BlogPostStatus)
  status?: BlogPostStatus = BlogPostStatus.DRAFT;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsString({ each: true })
  tags?: string[];
}
