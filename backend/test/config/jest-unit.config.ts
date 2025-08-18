import type { Config } from 'jest';

const config: Config = {
  displayName: 'Unit Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/../'],
  testMatch: [
    '<rootDir>/../**/__tests__/**/*.ts',
    '<rootDir>/../**/*.spec.ts',
    '<rootDir>/../**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/../node_modules/',
    '<rootDir>/../dist/',
    '<rootDir>/../test/integration/',
    '<rootDir>/../test/e2e/',
  ],
  collectCoverageFrom: [
    '<rootDir>/../src/**/*.ts',
    '!<rootDir>/../src/**/*.dto.ts',
    '!<rootDir>/../src/**/*.entity.ts',
    '!<rootDir>/../src/**/*.module.ts',
    '!<rootDir>/../src/main.ts',
    '!<rootDir>/../src/app.module.ts',
  ],
  coverageDirectory: '<rootDir>/../coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/../setup.ts'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/../../src/core/$1',
    '^@modules/(.*)$': '<rootDir>/../../src/modules/$1',
    '^@common/(.*)$': '<rootDir>/../../src/common/$1',
    '^src/(.*)$': '<rootDir>/../../src/$1',
    '^@/(.*)$': '<rootDir>/../../src/$1',
  },
  transform: {
    '^.+\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../../tsconfig.json',
      },
    ],
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
