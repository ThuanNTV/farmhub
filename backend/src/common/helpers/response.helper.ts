// src/common/helpers/response.helper.ts

export class ApiResponse {
  static Success<T>(data: T, message = 'Thành công', code = 200) {
    return {
      status: 'success',
      message,
      data,
      code,
    };
  }

  static Fail(message = 'Thất bại', statusCode = 400, data: any = null) {
    return {
      status: 'error',
      message,
      data,
      code: statusCode,
    };
  }
}
export class PaginatedResponse<T> {
  static Success<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Thành công',
    code = 200,
  ) {
    return {
      status: 'success',
      message,
      data,
      pagination: {
        total,
        page,
        limit,
      },
      code,
    };
  }
}
