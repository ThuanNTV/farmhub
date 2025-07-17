import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 🔧 IMPROVED MESSAGE HANDLING
    const { message, validationErrors } = this.getErrorMessage(exception);

    // 🔍 DETAILED ERROR LOGGING
    this.logError(exception, request, status);

    // 📋 CLEANER RESPONSE FORMAT
    const errorResponse = {
      status: 'error',
      message,
      data: null,
      code: status,
      // 🎯 Show validation errors clearly
      ...(validationErrors.length > 0 && {
        validationErrors,
      }),
      // 🔧 Add extra info in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          stack: exception instanceof Error ? exception.stack : undefined,
          details: this.getErrorDetails(exception),
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        },
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exception: unknown): {
    message: string;
    validationErrors: string[];
  } {
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();

      // 🎯 Handle validation pipe errors
      {
        const responseObj = exceptionResponse as {
          message: string | string[];
          [key: string]: unknown;
        };
        if (Array.isArray(responseObj.message)) {
          return {
            message: 'Dữ liệu không hợp lệ',
            validationErrors: responseObj.message,
          };
        }

        if (responseObj.message && typeof responseObj.message === 'string') {
          return {
            message: responseObj.message,
            validationErrors: [],
          };
        }
      }

      return {
        message: exception.message,
        validationErrors: [],
      };
    }

    if (exception instanceof HttpException) {
      return {
        message: exception.message,
        validationErrors: [],
      };
    }

    return {
      message: 'Lỗi hệ thống',
      validationErrors: [],
    };
  }

  private logError(exception: unknown, request: Request, status: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url, body, query, params, headers } = request;

    // 🚨 ERROR CONTEXT LOGGING
    this.logger.error('='.repeat(80));
    this.logger.error(`🚨 EXCEPTION CAUGHT`);
    this.logger.error(`📍 ${method} ${url}`);
    this.logger.error(`📊 Status: ${status}`);
    this.logger.error(`⏰ Time: ${new Date().toISOString()}`);

    // Request details
    this.logger.error(`📝 Request Details:`);
    this.logger.error(`  Body: ${JSON.stringify(body, null, 2)}`);
    this.logger.error(`  Query: ${JSON.stringify(query, null, 2)}`);
    this.logger.error(`  Params: ${JSON.stringify(params, null, 2)}`);
    this.logger.error(`  User-Agent: ${headers['user-agent']}`);

    // Exception details
    if (exception instanceof BadRequestException) {
      this.logger.error(`🔍 Validation Error Details:`);
      const response = exception.getResponse();
      if (typeof response === 'object') {
        const responseObj = response as {
          message: string | string[];
          [key: string]: unknown;
        };
        if (Array.isArray(responseObj.message)) {
          this.logger.error(`  Validation Errors:`);
          responseObj.message.forEach((msg: string, index: number) => {
            this.logger.error(`    ${index + 1}. ${msg}`);
          });
        }
      }
    } else if (exception instanceof HttpException) {
      this.logger.error(`🔍 HttpException Details:`);
      this.logger.error(`  Message: ${exception.message}`);
      this.logger.error(`  Status: ${exception.getStatus()}`);

      const response = exception.getResponse();
      if (typeof response === 'object') {
        this.logger.error(`  Response: ${JSON.stringify(response, null, 2)}`);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`💥 Error Details:`);
      this.logger.error(`  Name: ${exception.name}`);
      this.logger.error(`  Message: ${exception.message}`);
      this.logger.error(`  Stack: ${exception.stack}`);
    } else {
      this.logger.error(`❓ Unknown Exception:`);
      this.logger.error(`  Type: ${typeof exception}`);
      this.logger.error(`  Value: ${JSON.stringify(exception, null, 2)}`);
    }

    this.logger.error('='.repeat(80));
  }

  private getErrorDetails(exception: unknown): {
    type: string;
    name?: string;
    message?: string;
    status?: number;
    response?: unknown;
    stack?: string;
    value?: unknown;
  } {
    if (exception instanceof HttpException) {
      return {
        type: 'HttpException',
        name: exception.name,
        message: exception.message,
        status: exception.getStatus(),
        response: exception.getResponse(),
      };
    }

    if (exception instanceof Error) {
      return {
        type: 'Error',
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return {
      type: typeof exception,
      value: exception,
    };
  }
}

// 🎯 BONUS: Specific Database Exception Filter
@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const _request = ctx.getRequest<Request>();

    // 🔍 Database-specific error handling
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi cơ sở dữ liệu';

    if (exception && typeof exception === 'object' && 'code' in exception) {
      switch ((exception as { code: string }).code) {
        case '23505': // Unique violation
          status = HttpStatus.CONFLICT;
          message = 'Dữ liệu đã tồn tại';
          break;
        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Dữ liệu tham chiếu không tồn tại';
          break;
        case '23502': // Not null violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Thiếu thông tin bắt buộc';
          break;
        case 'ECONNREFUSED':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Không thể kết nối cơ sở dữ liệu';
          break;
        default:
          message =
            (exception as { message?: string }).message ??
            'Lỗi thao tác cơ sở dữ liệu';
      }
    }

    // 🚨 DETAILED DATABASE ERROR LOGGING
    this.logger.error('🗄️ DATABASE EXCEPTION');
    if (exception && typeof exception === 'object') {
      this.logger.error(`Code: ${(exception as { code?: string }).code}`);
      this.logger.error(`Detail: ${(exception as { detail?: string }).detail}`);
      this.logger.error(`Query: ${(exception as { query?: string }).query}`);
      this.logger.error(
        `Parameters: ${JSON.stringify((exception as { parameters?: unknown }).parameters)}`,
      );
      this.logger.error(`Schema: ${(exception as { schema?: string }).schema}`);
      this.logger.error(`Table: ${(exception as { table?: string }).table}`);
      this.logger.error(`Column: ${(exception as { column?: string }).column}`);
      this.logger.error(
        `Constraint: ${(exception as { constraint?: string }).constraint}`,
      );
    } else {
      this.logger.error(
        `Exception is not an object: ${JSON.stringify(exception)}`,
      );
    }

    response.status(status).json({
      status: 'error',
      message,
      data: null,
      code: status,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          dbCode:
            typeof exception === 'object' &&
            exception !== null &&
            'code' in exception
              ? (exception as { code?: string }).code
              : undefined,
          dbDetail:
            typeof exception === 'object' &&
            exception !== null &&
            'detail' in exception
              ? (exception as { detail?: string }).detail
              : undefined,
          query:
            typeof exception === 'object' &&
            exception !== null &&
            'query' in exception
              ? (exception as { query?: string }).query
              : undefined,
          parameters:
            typeof exception === 'object' &&
            exception !== null &&
            'parameters' in exception
              ? (exception as { parameters?: unknown }).parameters
              : undefined,
        },
      }),
    });
  }
}
