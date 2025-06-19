import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();
    const statusCode = res.statusCode || 200;

    return next.handle().pipe(
      map((response) => {
        return {
          status: 'success',
          message: response?.message || 'Thành công',
          data: response?.data ?? response,
          code: statusCode,
        };
      }),
    );
  }
}
