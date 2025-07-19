import { TransformInterceptor } from '../../../../src/common/interceptors/transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { classToPlain } from 'class-transformer';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let context: Partial<ExecutionContext>;
  let callHandler: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    const httpArgumentsHostMock = {
      getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      getRequest: jest.fn(),
      getNext: jest.fn(),
    };

    context = {
      switchToHttp: () => httpArgumentsHostMock,
    } as unknown as ExecutionContext;

    callHandler = { handle: jest.fn() };
    jest
      .spyOn(require('class-transformer'), 'classToPlain')
      .mockImplementation((data) => data);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('response có message và data', (done) => {
    (callHandler.handle as jest.Mock).mockReturnValue(
      of({ message: 'msg', data: { a: 1 } }),
    );
    interceptor
      .intercept(context as any, callHandler as any)
      .subscribe((res) => {
        expect(res).toEqual({
          status: 'success',
          message: 'msg',
          data: { a: 1 },
          code: 201,
        });
        done();
      });
  });

  it('response không có message, có data', (done) => {
    (callHandler.handle as jest.Mock).mockReturnValue(of({ data: { a: 2 } }));
    interceptor
      .intercept(context as any, callHandler as any)
      .subscribe((res) => {
        expect(res).toEqual({
          status: 'success',
          message: 'Thành công',
          data: { a: 2 },
          code: 201,
        });
        done();
      });
  });

  it('response là primitive', (done) => {
    (callHandler.handle as jest.Mock).mockReturnValue(of(123));
    interceptor
      .intercept(context as any, callHandler as any)
      .subscribe((res) => {
        expect(res).toEqual({
          status: 'success',
          message: 'Thành công',
          data: 123,
          code: 201,
        });
        done();
      });
  });

  it('classToPlain được gọi đúng', (done) => {
    const spy = jest.spyOn(require('class-transformer'), 'classToPlain');
    (callHandler.handle as jest.Mock).mockReturnValue(of({ data: { a: 3 } }));
    interceptor
      .intercept(context as any, callHandler as any)
      .subscribe((res) => {
        expect(spy).toHaveBeenCalled();
        done();
      });
  });
});
