import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from 'src/modules/orders/service/orders.service';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ProductsService } from 'src/modules/products/service/products.service';
import { InventoryTransfersService } from 'src/modules/inventory-transfers/service/inventory-transfers.service';
import { PaymentTransactionService } from 'src/modules/payments/service';
import { AuditTransactionService } from 'src/modules/audit-logs/service';

describe('OrdersService - Basic Test', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: TenantDataSourceService,
          useValue: { getTenantDataSource: jest.fn() },
        },
        {
          provide: ProductsService,
          useValue: { findById: jest.fn() },
        },
        {
          provide: InventoryTransfersService,
          useValue: { createInventoryTransfer: jest.fn() },
        },
        {
          provide: PaymentTransactionService,
          useValue: { processPayment: jest.fn() },
        },
        {
          provide: AuditTransactionService,
          useValue: { logOrderCreation: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
