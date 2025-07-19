import { PaymentsService } from 'src/modules/payments/service/payments.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let superCreate: jest.SpyInstance;
  let superFindById: jest.SpyInstance;
  let superGetRepo: jest.SpyInstance;
  let paymentTransactionService: any;
  let paymentGatewayService: any;
  let repo: any;
  let DtoMapper: any;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
    };
    paymentTransactionService = {
      createPayment: jest.fn(),
    };
    paymentGatewayService = {
      processPayment: jest.fn(),
      verifyPayment: jest.fn(),
    };
    DtoMapper = require('src/common/helpers/dto-mapper.helper');
    jest.spyOn(DtoMapper, 'DtoMapper', 'get').mockReturnValue({
      mapToEntity: jest.fn((x) => x),
    });
    service = new PaymentsService(
      { getTenantDataSource: jest.fn() } as any,
      paymentTransactionService,
      paymentGatewayService,
    );
    superCreate = jest
      .spyOn(PaymentsService.prototype, 'create')
      .mockImplementation();
    superFindById = jest
      .spyOn(PaymentsService.prototype, 'findById')
      .mockImplementation();
    superGetRepo = jest
      .spyOn(PaymentsService.prototype, 'getRepo')
      .mockResolvedValue(repo);
    jest.spyOn(service as any, 'mapToResponseDto').mockImplementation((x) => x);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // createPayment
  it('createPayment throw nếu amount <= 0', async () => {
    await expect(
      service.createPayment('store1', { amount: '0' } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.createPayment('store1', { amount: '-1' } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.createPayment('store1', { amount: 'abc' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('createPayment trả về đúng response khi hợp lệ', async () => {
    superCreate.mockResolvedValue({ id: 'p1' });
    const result = await service.createPayment('store1', {
      amount: '10',
    } as any);
    expect(result.id).toBe('p1');
  });

  it('createPayment throw nếu super.create lỗi', async () => {
    superCreate.mockRejectedValue(new Error('fail'));
    await expect(
      service.createPayment('store1', { amount: '10' } as any),
    ).rejects.toThrow('fail');
  });

  // createPaymentInTransaction
  it('createPaymentInTransaction gọi paymentTransactionService', async () => {
    paymentTransactionService.createPayment.mockResolvedValue('ok');
    const result = await service.createPaymentInTransaction(
      'o1',
      10,
      'pm1',
      'u1',
      {} as any,
    );
    expect(result).toBe('ok');
  });

  // processPaymentGateway
  it('processPaymentGateway gọi paymentGatewayService', async () => {
    paymentGatewayService.processPayment.mockResolvedValue({ success: true });
    const result = await service.processPaymentGateway(10, 'pm1', 'o1');
    expect(result.success).toBe(true);
  });

  // verifyPaymentGateway
  it('verifyPaymentGateway gọi paymentGatewayService', async () => {
    paymentGatewayService.verifyPayment.mockResolvedValue({
      success: true,
      status: 'PAID',
    });
    const result = await service.verifyPaymentGateway('tx1');
    expect(result.status).toBe('PAID');
  });

  // findPaymentById
  it('findPaymentById trả về null nếu không tìm thấy', async () => {
    superFindById.mockResolvedValue(null);
    const result = await service.findPaymentById('store1', 'id1');
    expect(result).toBeNull();
  });

  it('findPaymentById trả về đúng response nếu có entity', async () => {
    superFindById.mockResolvedValue({ id: 'p1' });
    const result = await service.findPaymentById('store1', 'id1');
    expect(result.id).toBe('p1');
  });

  it('findPaymentById throw nếu super.findById lỗi', async () => {
    superFindById.mockRejectedValue(new Error('fail'));
    await expect(service.findPaymentById('store1', 'id1')).rejects.toThrow(
      'fail',
    );
  });

  // findOne
  it('findOne throw nếu không tìm thấy', async () => {
    superFindById.mockResolvedValue(null);
    await expect(service.findOne('store1', 'id1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne trả về đúng response nếu có entity', async () => {
    superFindById.mockResolvedValue({ id: 'p1' });
    const result = await service.findOne('store1', 'id1');
    expect(result.id).toBe('p1');
  });

  it('findOne throw nếu super.findById lỗi', async () => {
    superFindById.mockRejectedValue(new Error('fail'));
    await expect(service.findOne('store1', 'id1')).rejects.toThrow('fail');
  });

  // findAllPayments
  it('findAllPayments trả về đúng response', async () => {
    repo.find.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
    const result = await service.findAllPayments('store1');
    expect(result.length).toBe(2);
  });

  it('findAllPayments throw nếu repo.find lỗi', async () => {
    repo.find.mockRejectedValue(new Error('fail'));
    await expect(service.findAllPayments('store1')).rejects.toThrow('fail');
  });

  // updatePayment
  it('updatePayment throw nếu không tìm thấy', async () => {
    superFindById.mockResolvedValue(null);
    await expect(
      service.updatePayment('store1', 'id1', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updatePayment throw nếu amount <= 0', async () => {
    superFindById.mockResolvedValue({ id: 'p1' });
    await expect(
      service.updatePayment('store1', 'id1', { amount: '0' } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.updatePayment('store1', 'id1', { amount: '-1' } as any),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.updatePayment('store1', 'id1', { amount: 'abc' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('updatePayment trả về đúng response khi hợp lệ', async () => {
    superFindById.mockResolvedValue({ id: 'p1' });
    repo.merge.mockReturnValue({ id: 'p1', amount: 10 });
    repo.save.mockResolvedValue({ id: 'p1', amount: 10 });
    const result = await service.updatePayment('store1', 'id1', {
      amount: '10',
    } as any);
    expect(result.id).toBe('p1');
  });

  it('updatePayment throw nếu repo.save lỗi', async () => {
    superFindById.mockResolvedValue({ id: 'p1' });
    repo.merge.mockReturnValue({ id: 'p1', amount: 10 });
    repo.save.mockRejectedValue(new Error('fail'));
    await expect(
      service.updatePayment('store1', 'id1', { amount: '10' } as any),
    ).rejects.toThrow('fail');
  });
});
