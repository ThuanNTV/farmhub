import { Test, TestingModule } from '@nestjs/testing';
import { CategorysService } from '../../src/service/categorys.service';
import { CategorysController } from 'src/controller/categorys.controller';

describe('CategorysController', () => {
  let controller: CategorysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategorysController],
      providers: [CategorysService],
    }).compile();

    controller = module.get<CategorysController>(CategorysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
