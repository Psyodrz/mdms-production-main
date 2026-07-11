import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, Min, MaxLength } from 'class-validator';

export class UpsertPortfolioItemDto {
  @IsString() @MaxLength(200)
  title!: string;

  @IsString() @MaxLength(300)
  slug!: string;

  @IsString() @MaxLength(1000)
  description!: string;

  @IsOptional() @IsUrl()
  coverImageUrl?: string; // Align with schema.prisma coverImageUrl

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
