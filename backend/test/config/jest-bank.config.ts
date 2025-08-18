import type { Config } from 'jest';

// Jest config scoped to the Bank module to measure coverage only for this module
const config: Config = {
  displayName: 'Bank Module Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/'],
  testMatch: [
    // Only run Bank module unit tests
    '<rootDir>/unit/modules/bank/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/../node_modules/',
    '<rootDir>/../dist/',
    '<rootDir>/integration/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    // Only collect coverage from Bank module implementation files
    '<rootDir>/../src/modules/bank/**/*.{ts,js}',
    '!<rootDir>/../src/modules/bank/**/*.dto.ts',
    '!<rootDir>/../src/modules/bank/**/dto/**',
    '!<rootDir>/../src/modules/bank/**/*.entity.ts',
    '!<rootDir>/../src/modules/bank/**/*.module.ts',
  ],
  coverageDirectory: '<rootDir>/../coverage/bank',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  // Enforce 80%+ coverage for this module only
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/setup/unit-setup.ts'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../src/core/$1',
    '^@modules/(.*)$': '<rootDir>/../src/modules/$1',
    '^@common/(.*)$': '<rootDir>/../src/common/$1',
    '^src/(.*)$': '<rootDir>/../src/$1',
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverage: true,
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};

export default config;
