import { config } from 'dotenv';
import { TestDatabase } from '../utils/test-database';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup for integration tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DATABASE_URL =
    'postgresql://test:test@localhost:5432/farmhub_test';
  process.env.TENANT_DATABASE_URL =
    'postgresql://test:test@localhost:5432/farmhub_tenant_test';

  // Initialize test database
  try {
    await TestDatabase.initialize();
    console.log('✅ Test database initialized');
  } catch (error) {
    console.warn(
      '⚠️ Could not initialize test database:',
      (error as Error).message,
    );
  }
});

afterAll(async () => {
  // Cleanup test database
  try {
    await TestDatabase.cleanup();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.warn(
      '⚠️ Could not cleanup test database:',
      (error as Error).message,
    );
  }
});

beforeEach(async () => {
  // Clear all tables before each test
  try {
    await TestDatabase.clearTables();
  } catch (error) {
    console.warn('⚠️ Could not clear test tables:', (error as Error).message);
  }
});

// Increase timeout for integration tests
jest.setTimeout(30000);
