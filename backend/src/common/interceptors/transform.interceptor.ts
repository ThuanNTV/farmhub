import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    status: string;
    message: string;
    data: unknown;
    code: number;
  }> {
    const ctx = context.switchToHttp();
    const res: { statusCode?: number } = ctx.getResponse();
    const statusCode: number = res.statusCode ?? 200;

    return next.handle().pipe(
      map((response: unknown) => {
        let message: string;
        let data: unknown;

        if (
          typeof response === 'object' &&
          response !== null &&
          'message' in response &&
          typeof (response as { message?: unknown }).message === 'string'
        ) {
          message = (response as { message?: string }).message ?? 'Thành công';
        } else {
          message = 'Thành công';
        }

        if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response
        ) {
          data = (response as { data?: unknown }).data ?? response;
        } else {
          data = response;
        }

        return {
          status: 'success',
          message,
          data,
          code: statusCode,
        };
      }),
    );
  }
}
