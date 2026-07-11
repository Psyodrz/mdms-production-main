import { IsEnum } from 'class-validator';
import { Role } from '@mdms/types';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
