import { IsIn } from 'class-validator';

/**
 * A talent's response to an inbound hire request. Only the response-relevant
 * statuses are accepted (talents cannot reset a request back to NEW).
 */
export class RespondHireRequestDto {
  @IsIn(['CONFIRMED', 'DECLINED', 'IN_DISCUSSION'])
  status!: 'CONFIRMED' | 'DECLINED' | 'IN_DISCUSSION';
}
