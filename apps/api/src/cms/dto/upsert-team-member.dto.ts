import { IsString, IsOptional, IsBoolean, IsUrl, IsInt, Min, MaxLength, IsEmail } from 'class-validator';

export class UpsertTeamMemberDto {
  @IsOptional() @IsString()
  id?: string;

  @IsString() @MaxLength(200)
  name!: string;

  @IsString() @MaxLength(200)
  role!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  bio?: string;

  @IsOptional() @IsUrl()
  photoUrl?: string; // Align with schema.prisma photoUrl

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}
