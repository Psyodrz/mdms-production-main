import { IsString, IsEmail, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateHireRequestDto {
  @IsString()
  @MaxLength(100)
  requesterName!: string;

  @IsEmail()
  requesterEmail!: string;

  @IsString()
  @MaxLength(20)
  requesterPhone!: string;

  @IsString()
  @MaxLength(100)
  projectType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsDateString()
  dateNeeded?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  budgetRange?: string;

  @IsString()
  @MaxLength(2000)
  briefDescription!: string;
}

