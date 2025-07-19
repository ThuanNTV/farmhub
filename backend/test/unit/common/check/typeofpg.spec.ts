import {
  PostgreSQLTypes,
  UnsupportedTypes,
} from '../../../../src/common/check/typeofpg';

describe('typeofpg', () => {
  it('PostgreSQLTypes có các key/value đúng', () => {
    expect(PostgreSQLTypes.varchar).toBe('varchar');
    expect(PostgreSQLTypes.char).toBe('char');
    expect(PostgreSQLTypes.text).toBe('text');
    expect(PostgreSQLTypes.integer).toBe('integer');
    expect(PostgreSQLTypes.bigint).toBe('bigint');
    expect(PostgreSQLTypes.smallint).toBe('smallint');
    expect(PostgreSQLTypes.decimal).toBe('decimal');
    expect(PostgreSQLTypes.numeric).toBe('numeric');
    expect(PostgreSQLTypes.real).toBe('real');
    expect(PostgreSQLTypes['double']).toBeUndefined();
    expect(PostgreSQLTypes['double precision']).toBe('double precision');
    expect(PostgreSQLTypes.boolean).toBe('boolean');
    expect(PostgreSQLTypes.date).toBe('date');
    expect(PostgreSQLTypes.time).toBe('time');
    expect(PostgreSQLTypes.timestamp).toBe('timestamp');
    expect(PostgreSQLTypes.timestamptz).toBe('timestamptz');
    expect(PostgreSQLTypes.json).toBe('json');
    expect(PostgreSQLTypes.jsonb).toBe('jsonb');
    expect(PostgreSQLTypes.uuid).toBe('uuid');
    expect(PostgreSQLTypes['varchar[]']).toBe('varchar[]');
    expect(PostgreSQLTypes['integer[]']).toBe('integer[]');
  });

  it('UnsupportedTypes có các key/value đúng', () => {
    expect(UnsupportedTypes.nvarchar).toBe('nvarchar');
    expect(UnsupportedTypes.nchar).toBe('nchar');
    expect(UnsupportedTypes.ntext).toBe('ntext');
    expect(UnsupportedTypes.datetime).toBe('datetime');
    expect(UnsupportedTypes.datetime2).toBe('datetime2');
    expect(UnsupportedTypes.money).toBe('money');
  });
});
