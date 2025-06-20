import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from '../../src/service/customers.service';
import { CustomersController } from 'src/controller/customers.controller';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [CustomersService],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
