import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standardized API response format.
 * All endpoints return: { success, data, message, errors?, meta? }
 * Reference: SRS Section 3.3
 */
export interface ApiResponseShape<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: { field?: string; code: string; message: string }[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseShape<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseShape<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the controller already returned the standard shape, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponseShape<T>;
        }

        return {
          success: true,
          data: data ?? null,
          message: 'OK',
        };
      }),
    );
  }
}
