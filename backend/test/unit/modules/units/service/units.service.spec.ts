import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from 'src/modules/units/service/units.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Unit } from 'src/entities/global/unit.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UnitsService (unit)', () => {
  let service: UnitsService;
  let repo: jest.Mocked<Repository<Unit>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        {
          provide: getRepositoryToken(Unit, 'globalConnection'),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UnitsService);
    repo = module.get(getRepositoryToken(Unit, 'globalConnection'));
  });

  afterEach(() => jest.clearAllMocks());

  const entity: Unit = {
    id: 'u1',
    name: 'Kilogram',
    created_at: new Date(),
    updated_at: new Date(),
    is_deleted: false,
    created_by_user_id: 'user1',
  } as Unit;

  it('create - success and unique validation', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const res = await service.create({ name: 'Kilogram' }, 'user1');
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { name: 'Kilogram', is_deleted: false },
    });
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(res).toEqual(entity);
  });

  it('create - duplicate name throws Conflict', async () => {
    repo.findOne.mockResolvedValue(entity);
    await expect(
      service.create({ name: 'Kilogram' }, 'u'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll - returns list', async () => {
    repo.find.mockResolvedValue([entity]);
    const res = await service.findAll();
    expect(res).toEqual([entity]);
  });

  it('findAllWithFilter - applies search and pagination', async () => {
    repo.findAndCount.mockResolvedValue([[entity], 1]);
    const res = await service.findAllWithFilter({
      search: 'kg',
      page: 2,
      limit: 10,
    });
    expect(repo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: expect.any(Object) }),
        skip: 10,
        take: 10,
      }),
    );
    expect(res.total).toBe(1);
  });

  it('findOne - not found throws', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update - unique validation and save', async () => {
    repo.findOne
      .mockResolvedValueOnce({ ...entity }) // existing by id
      .mockResolvedValueOnce(null); // no duplicate for new name
    repo.save.mockResolvedValue({ ...entity, name: 'Gram' } as Unit);

    const res = await service.update('u1', { name: 'Gram' }, 'user1');
    expect(res.name).toBe('Gram');
  });

  it('remove - soft delete and message', async () => {
    repo.findOne.mockResolvedValue({ ...entity });
    repo.save.mockResolvedValue({ ...entity, is_deleted: true } as Unit);
    const res = await service.remove('u1', 'user1');
    expect(res).toHaveProperty('message');
  });

  it('restore - not found throws', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.restore('u1', 'u')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
