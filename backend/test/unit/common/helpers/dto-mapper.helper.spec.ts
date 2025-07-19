import {
  DtoMapper,
  toSnakeCase,
  toCamelCase,
  upperCaseKeys,
} from '../../../../src/common/helpers/dto-mapper.helper';

describe('DtoMapper', () => {
  describe('mapToEntity', () => {
    it('chuyển camelCase sang snake_case', () => {
      const dto = { userName: 'abc', fullName: 'def', age: 20 };
      const entity = DtoMapper.mapToEntity(dto);
      expect(entity).toEqual({ user_name: 'abc', full_name: 'def', age: 20 });
    });
    it('bỏ qua undefined/null', () => {
      const dto = { a: 1, b: undefined, c: null };
      const entity = DtoMapper.mapToEntity(dto);
      expect(entity).toEqual({ a: 1 });
    });
    it('empty object', () => {
      expect(DtoMapper.mapToEntity({})).toEqual({});
    });
  });

  describe('mapToDto', () => {
    it('chuyển snake_case sang camelCase', () => {
      const entity = { user_name: 'abc', full_name: 'def', age: 20 };
      const dto = DtoMapper.mapToDto(entity);
      expect(dto).toEqual({ userName: 'abc', fullName: 'def', age: 20 });
    });
    it('bỏ qua undefined/null', () => {
      const entity = { a: 1, b: undefined, c: null };
      const dto = DtoMapper.mapToDto(entity);
      expect(dto).toEqual({ a: 1 });
    });
    it('empty object', () => {
      expect(DtoMapper.mapToDto({})).toEqual({});
    });
  });
});

describe('toSnakeCase', () => {
  it('chuyển camelCase sang snake_case', () => {
    const obj = { userName: 'abc', fullName: 'def', age: 20 };
    expect(toSnakeCase(obj)).toEqual({
      user_name: 'abc',
      full_name: 'def',
      age: 20,
    });
  });
  it('empty object', () => {
    expect(toSnakeCase({})).toEqual({});
  });
});

describe('toCamelCase', () => {
  it('chuyển snake_case sang camelCase', () => {
    const obj = { user_name: 'abc', full_name: 'def', age: 20 };
    expect(toCamelCase(obj)).toEqual({
      userName: 'abc',
      fullName: 'def',
      age: 20,
    });
  });
  it('empty object', () => {
    expect(toCamelCase({})).toEqual({});
  });
});

describe('upperCaseKeys', () => {
  it('chuyển tất cả key sang upper case', () => {
    const obj = { a: 1, bB: 2, c_c: 3 };
    expect(upperCaseKeys(obj)).toEqual({ A: 1, BB: 2, C_C: 3 });
  });
  it('empty object', () => {
    expect(upperCaseKeys({})).toEqual({});
  });
});
