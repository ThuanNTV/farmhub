import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.DB_DATABASE = 'farmhub_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
  console.log('Setting up unit tests...');
});

afterAll(() => {
  // Cleanup any global test resources
  console.log('Cleaning up unit tests...');
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Increase timeout for unit tests
jest.setTimeout(10000);
