import { Logger } from '@nestjs/common';
import { config } from 'dotenv';

// Load test environment variables
// config({ path: '.env.test' });
config({ path: '.env' });

// Global test setup for E2E tests
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DATABASE_URL =
    'postgresql://test:test@localhost:5432/farmhub_test';
  process.env.TENANT_DATABASE_URL =
    'postgresql://test:test@localhost:5432/farmhub_tenant_test';

  Logger.log('🚀 Starting E2E test environment...');
});

afterAll(() => {
  Logger.log('✅ E2E test environment cleaned up');
});

// Increase timeout for E2E tests
jest.setTimeout(60000);
