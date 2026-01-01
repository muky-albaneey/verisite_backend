import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto, PaginatedResponseDto } from '../dto/base-response.dto';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If already formatted, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If paginated response
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return new PaginatedResponseDto(data.data, data.meta);
        }

        // Default success response
        return new SuccessResponseDto(data);
      }),
    );
  }
}

