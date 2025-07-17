import { DeepPartial } from 'typeorm';

export class DtoMapper {
  /**
   * Maps DTO fields to entity fields using common naming conventions
   * Converts camelCase to snake_case for database fields
   */
  static mapToEntity<T>(dto: Record<string, unknown>): DeepPartial<T> {
    const entity: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && value !== null) {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        entity[snakeKey] = value;
      }
    }

    return entity as DeepPartial<T>;
  }

  /**
   * Maps entity fields to DTO fields
   * Converts snake_case to camelCase for API responses
   */
  static mapToDto<T>(entity: Record<string, unknown>): T {
    const dto: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(entity)) {
      if (value !== undefined && value !== null) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          letter.toUpperCase(),
        );
        dto[camelKey] = value;
      }
    }

    return dto as T;
  }
}

export function toSnakeCase(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter: string) => `_${letter.toLowerCase()}`,
      );
      acc[snakeKey] = obj[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

export function toCamelCase(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );
      acc[camelKey] = obj[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

export function upperCaseKeys(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key.toUpperCase()] = obj[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );
}
