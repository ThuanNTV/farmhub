export class BaseResponseDto<T = any> {
  message: string;
  data?: T;
  errors?: any;

  constructor(message: string, data?: T, errors?: any) {
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
