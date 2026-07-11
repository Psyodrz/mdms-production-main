import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@mdms/types';

export class CreateUserDto {
  // When creating alongside a Supabase Auth user, the caller passes the
  // Supabase user id so the Prisma record shares the same id (token.sub).
  @IsOptional() @IsString()
  id?: string;

  @IsEmail()
  email!: string;

  @IsString() @MaxLength(100)
  firstName!: string;

  @IsOptional() @IsString() @MaxLength(100)
  lastName?: string;

  @IsEnum(Role)
  role!: Role;
}
