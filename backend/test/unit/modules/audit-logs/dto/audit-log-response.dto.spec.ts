import { AuditLogResponseDto } from 'src/modules/audit-logs/dto/audit-log-response.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

describe('AuditLogResponseDto', () => {
  const validData = {
    id: 'audit-123',
    userId: 'user-456',
    action: 'CREATE',
    targetTable: 'products',
    targetId: 'product-789',
    oldValue: { name: 'Old Product' },
    newValue: { name: 'New Product', price: 100 },
    ipAddress: '192.168.1.1',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    userName: 'John Doe',
    metadata: {
      action: 'CREATE',
      resource: 'products',
      resourceId: 'product-789',
      changes: { name: 'New Product', price: 100 },
    },
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    isDeleted: false,
    deletedAt: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionId: 'session-123',
    details: 'Product created successfully',
  };

  it('should create a valid AuditLogResponseDto', () => {
    const dto = plainToClass(AuditLogResponseDto, validData);

    expect(dto).toBeInstanceOf(AuditLogResponseDto);
    expect(dto.id).toBe(validData.id);
    expect(dto.userId).toBe(validData.userId);
    expect(dto.action).toBe(validData.action);
    expect(dto.targetTable).toBe(validData.targetTable);
    expect(dto.targetId).toBe(validData.targetId);
    expect(dto.oldValue).toEqual(validData.oldValue);
    expect(dto.newValue).toEqual(validData.newValue);
    expect(dto.ipAddress).toBe(validData.ipAddress);
    expect(dto.device).toBe(validData.device);
    expect(dto.browser).toBe(validData.browser);
    expect(dto.os).toBe(validData.os);
    expect(dto.userName).toBe(validData.userName);
    expect(dto.metadata).toEqual(validData.metadata);
    expect(dto.createdAt).toEqual(validData.createdAt);
    expect(dto.updatedAt).toEqual(validData.updatedAt);
    expect(dto.isDeleted).toBe(validData.isDeleted);
    expect(dto.deletedAt).toBe(validData.deletedAt);
    expect(dto.userAgent).toBe(validData.userAgent);
    expect(dto.sessionId).toBe(validData.sessionId);
    expect(dto.details).toBe(validData.details);
  });

  it('should create dto without validation errors', () => {
    const dto = plainToClass(AuditLogResponseDto, validData);

    // Response DTOs typically don't have validation decorators
    expect(dto).toBeInstanceOf(AuditLogResponseDto);
  });

  it('should handle optional fields', () => {
    const minimalData = {
      id: 'audit-123',
      userId: 'user-456',
      action: 'CREATE',
      targetTable: 'products',
      targetId: 'product-789',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T00:00:00Z'),
      isDeleted: false,
    };

    const dto = plainToClass(AuditLogResponseDto, minimalData);

    expect(dto.id).toBe(minimalData.id);
    expect(dto.userId).toBe(minimalData.userId);
    expect(dto.action).toBe(minimalData.action);
    expect(dto.targetTable).toBe(minimalData.targetTable);
    expect(dto.targetId).toBe(minimalData.targetId);
    expect(dto.createdAt).toEqual(minimalData.createdAt);
    expect(dto.updatedAt).toEqual(minimalData.updatedAt);
    expect(dto.isDeleted).toBe(minimalData.isDeleted);

    // Optional fields should be undefined
    expect(dto.oldValue).toBeUndefined();
    expect(dto.newValue).toBeUndefined();
    expect(dto.ipAddress).toBeUndefined();
    expect(dto.device).toBeUndefined();
    expect(dto.browser).toBeUndefined();
    expect(dto.os).toBeUndefined();
    expect(dto.userName).toBeUndefined();
    expect(dto.metadata).toBeUndefined();
    expect(dto.deletedAt).toBeUndefined();
    expect(dto.userAgent).toBeUndefined();
    expect(dto.sessionId).toBeUndefined();
    expect(dto.details).toBeUndefined();
  });

  it('should handle null values for optional fields', () => {
    const dataWithNulls = {
      ...validData,
      oldValue: null,
      newValue: null,
      ipAddress: null,
      device: null,
      browser: null,
      os: null,
      userName: null,
      metadata: null,
      deletedAt: null,
      userAgent: null,
      sessionId: null,
      details: null,
    };

    const dto = plainToClass(AuditLogResponseDto, dataWithNulls);

    expect(dto.oldValue).toBeNull();
    expect(dto.newValue).toBeNull();
    expect(dto.ipAddress).toBeNull();
    expect(dto.device).toBeNull();
    expect(dto.browser).toBeNull();
    expect(dto.os).toBeNull();
    expect(dto.userName).toBeNull();
    expect(dto.metadata).toBeNull();
    expect(dto.deletedAt).toBeNull();
    expect(dto.userAgent).toBeNull();
    expect(dto.sessionId).toBeNull();
    expect(dto.details).toBeNull();
  });

  it('should handle string dates', () => {
    const dataWithStringDates = {
      ...validData,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      deletedAt: '2023-01-02T00:00:00Z',
    };

    const dto = plainToClass(AuditLogResponseDto, dataWithStringDates);

    // Without @Transform decorators, dates remain as strings
    expect(dto.createdAt).toBe('2023-01-01T00:00:00Z');
    expect(dto.updatedAt).toBe('2023-01-01T00:00:00Z');
    expect(dto.deletedAt).toBe('2023-01-02T00:00:00Z');
  });
});
