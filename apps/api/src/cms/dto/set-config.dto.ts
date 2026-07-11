import { IsObject } from 'class-validator';

export class SetConfigDto {
  @IsObject()
  value!: Record<string, unknown>;
}
