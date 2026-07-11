import { IsString, IsOptional, IsNotEmpty, IsDateString, MaxLength, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCastingCallDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @IsString() @IsNotEmpty()
  description!: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  projectType!: string;

  @IsOptional() @IsString() @MaxLength(120)
  city?: string;

  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @IsOptional() @IsString() @MaxLength(120)
  compensationType?: string;

  @IsOptional() @IsString() @MaxLength(300)
  compensationDetails?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  slotsAvailable?: number;

  @IsOptional() @IsDateString()
  deadline?: string;

  @IsOptional() @IsDateString()
  shootDate?: string;
}
