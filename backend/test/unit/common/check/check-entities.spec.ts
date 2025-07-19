import { DataSource } from 'typeorm';
import { checkEntities } from '../../../../src/common/check/check-entities';
import { Logger } from '@nestjs/common';

function createTestDataSource() {
  return new DataSource({
    type: 'postgres',
    database: ':memory:',
    entities: [],
    synchronize: false,
  });
}

describe('checkEntities', () => {
  let dataSource: DataSource;

  it('kết nối thành công, log entity, log table', async () => {
    dataSource = createTestDataSource();
    jest.spyOn(dataSource, 'initialize').mockResolvedValue(dataSource);
    jest.spyOn(dataSource, 'destroy').mockResolvedValue();
    Object.defineProperty(dataSource, 'entityMetadatas', {
      value: [
        {
          name: 'Entity1',
          tableName: 'table1',
          columns: [{ propertyName: 'col1' }],
        } as any,
      ],
      configurable: true,
    });
    jest.spyOn(dataSource, 'synchronize').mockResolvedValue();
    jest
      .spyOn(dataSource, 'query')
      .mockResolvedValue([{ table_name: 'table1' }]);
    const logSpy = jest.spyOn(Logger, 'log').mockImplementation(() => {});
    await checkEntities(dataSource);
    expect(dataSource.initialize).toHaveBeenCalled();
    expect(dataSource.synchronize).toHaveBeenCalled();
    expect(dataSource.destroy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
  });

  it('kết nối lỗi sẽ log error', async () => {
    dataSource = createTestDataSource();
    jest.spyOn(dataSource, 'initialize').mockRejectedValue(new Error('fail'));
    const errorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
    await checkEntities(dataSource);
    expect(errorSpy).toHaveBeenCalled();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
  });
});
