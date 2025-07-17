import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'E2E Tests',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testRegex: 'test/e2e/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/main copy.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.decorator.ts',
  ],
  coverageDirectory: './coverage/e2e',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/test/e2e/'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/test/setup/e2e-setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: false, // E2E tests typically don't need coverage
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
