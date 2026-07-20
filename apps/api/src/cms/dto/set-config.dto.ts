import { IsDefined, IsOptional, IsString } from 'class-validator';

export class SetConfigDto {
  /**
   * Site config payloads are arbitrary JSON. Depending on the key the value is
   * either an object (hero, footer, pricing, navbar, seo) or an array (stats,
   * showreels). Accept any defined value here — it is JSON-stringified before
   * being persisted, so structural validation lives with each consumer.
   */
  @IsDefined()
  value!: unknown;

  /**
   * Optional storage-type hint sent by the CMS client (defaults to 'json').
   * Declared here so the global ValidationPipe (whitelist + forbidNonWhitelisted)
   * does not reject the request with "property type should not exist".
   */
  @IsOptional()
  @IsString()
  type?: string;
}
