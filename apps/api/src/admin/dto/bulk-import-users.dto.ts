import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@mdms/types';

export class ImportUserItemDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  password?: string;
}

export class BulkImportUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportUserItemDto)
  users!: ImportUserItemDto[];

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}
