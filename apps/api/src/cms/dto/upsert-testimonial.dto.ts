import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';

export class UpsertTestimonialDto {
  @IsString() @MaxLength(200)
  clientName!: string;

  @IsOptional() @IsString() @MaxLength(200)
  clientTitle?: string;

  @IsOptional() @IsString() @MaxLength(200)
  clientCompany?: string;

  @IsString() @MaxLength(2000)
  content!: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  rating?: number;

  @IsOptional() @IsBoolean()
  isApproved?: boolean;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;
}
