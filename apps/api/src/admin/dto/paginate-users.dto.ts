import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@mdms/types';

export class PaginateUsersDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000)
  limit?: number = 250;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;
}
