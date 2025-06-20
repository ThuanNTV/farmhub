import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from '../../src/service/stores.service';
import { StoresController } from 'src/controller/stores.controller';

describe('StoresController', () => {
  let controller: StoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [StoresService],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
