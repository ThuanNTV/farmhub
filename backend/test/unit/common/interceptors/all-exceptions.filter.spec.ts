import {
  AllExceptionsFilter,
  DatabaseExceptionFilter,
} from '../../../../src/common/interceptors/all-exceptions.filter';
import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let loggerError: jest.SpyInstance;
  let loggerLog: jest.SpyInstance;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    loggerLog = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockRequest = {
      url: '/test',
      method: 'GET',
      body: {},
      query: {},
      params: {},
      headers: { 'user-agent': 'test' },
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('BadRequestException với message array', () => {
    const ex = new BadRequestException(['err1', 'err2']);
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Dữ liệu không hợp lệ',
        validationErrors: ['err1', 'err2'],
      }),
    );
  });

  it('BadRequestException với message string', () => {
    const ex = new BadRequestException('err');
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'err',
      data: null,
      code: 400,
    });
  });

  it('HttpException khác', () => {
    const ex = new HttpException('err', 403);
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'err',
        code: 403,
      }),
    );
  });

  it('Error thường', () => {
    const ex = new Error('fail');
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Lỗi hệ thống',
        code: 500,
      }),
    );
  });

  it('object lạ', () => {
    const ex = { foo: 1 };
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Lỗi hệ thống',
        code: 500,
      }),
    );
  });

  it('trả về debug khi NODE_ENV=development', () => {
    process.env.NODE_ENV = 'development';
    const ex = new HttpException('err', 400);
    filter.catch(ex, mockHost);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ debug: expect.any(Object) }),
    );
    process.env.NODE_ENV = '';
  });

  it('không trả về debug khi NODE_ENV!=development', () => {
    process.env.NODE_ENV = 'production';
    const ex = new HttpException('err', 400);
    filter.catch(ex, mockHost);
    expect(mockResponse.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ debug: expect.any(Object) }),
    );
    process.env.NODE_ENV = '';
  });
});

describe('AllExceptionsFilter bổ sung coverage', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockRequest = {
      url: '/test',
      method: 'GET',
      body: {},
      query: {},
      params: {},
      headers: { 'user-agent': 'test' },
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('exception là null', () => {
    filter.catch(null, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống', code: 500 }),
    );
  });

  it('exception là undefined', () => {
    filter.catch(undefined, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống', code: 500 }),
    );
  });

  it('exception là number', () => {
    filter.catch(123, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống', code: 500 }),
    );
  });

  it('exception là string', () => {
    filter.catch('error string', mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống', code: 500 }),
    );
  });

  it('exception là boolean', () => {
    filter.catch(true, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống', code: 500 }),
    );
  });

  it('BadRequestException với getResponse trả về object không có message', () => {
    const ex = new BadRequestException();
    jest.spyOn(ex, 'getResponse').mockReturnValue({ foo: 'bar' });
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ex.message, code: 400 }),
    );
  });

  it('logger.error throw error không làm crash filter', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {
      throw new Error('logger fail');
    });
    const ex = new Error('fail');
    expect(() => filter.catch(ex, mockHost)).not.toThrow();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('request thiếu trường', () => {
    mockRequest = { url: '/test', method: 'GET' }; // thiếu body, query, params, headers
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
    const ex = new Error('fail');
    filter.catch(ex, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('response.status throw error không làm crash filter', () => {
    mockResponse.status = jest.fn(() => {
      throw new Error('status fail');
    });
    const ex = new Error('fail');
    expect(() => filter.catch(ex, mockHost)).not.toThrow();
  });

  it('response.json throw error không làm crash filter', () => {
    mockResponse.json = jest.fn(() => {
      throw new Error('json fail');
    });
    const ex = new Error('fail');
    expect(() => filter.catch(ex, mockHost)).not.toThrow();
  });
});

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;
  let loggerError: jest.SpyInstance;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new DatabaseExceptionFilter();
    loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('code 23505 trả về CONFLICT', () => {
    filter.catch({ code: '23505' }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dữ liệu đã tồn tại' }),
    );
  });

  it('code 23503 trả về BAD_REQUEST', () => {
    filter.catch({ code: '23503' }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dữ liệu tham chiếu không tồn tại' }),
    );
  });

  it('code 23502 trả về BAD_REQUEST', () => {
    filter.catch({ code: '23502' }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Thiếu thông tin bắt buộc' }),
    );
  });

  it('code ECONNREFUSED trả về SERVICE_UNAVAILABLE', () => {
    filter.catch({ code: 'ECONNREFUSED' }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.SERVICE_UNAVAILABLE,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Không thể kết nối cơ sở dữ liệu' }),
    );
  });

  it('code khác trả về INTERNAL_SERVER_ERROR', () => {
    filter.catch({ code: '999', message: 'err' }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'err' }),
    );
  });

  it('object không code trả về INTERNAL_SERVER_ERROR', () => {
    filter.catch({ foo: 1 }, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi cơ sở dữ liệu' }),
    );
  });
});
