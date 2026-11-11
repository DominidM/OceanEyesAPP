/* global __dirname */
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const transform = {
  '^.+\.[tj]sx?$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.js') }],
};

module.exports = {
  rootDir: repoRoot,
  testTimeout: 30000,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/mobile/modules/reports/domain/**/*.ts',
    'src/mobile/modules/auth/presentation/viewmodels/*.ts',
    'src/mobile/modules/reports/presentation/viewmodels/report-create.viewmodel.ts',
    'src/mobile/shared/offline/outbox.ts',
    'src/mobile/shared/offline/sync-engine.ts',
  ],

  projects: [
    {
      displayName: 'unit',
      rootDir: repoRoot,
      roots: ['<rootDir>/__tests__/unit'],
      testEnvironment: 'node',
      testMatch: ['**/*.test.ts'],
      transform,
      moduleDirectories: ['node_modules', '<rootDir>/__tests__/node_modules'],
      moduleNameMapper: {
        '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/mocks/async-storage.js',
        '^@/(.*)$': '<rootDir>/src/mobile/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
      },
    },
    {
      displayName: 'rules',
      rootDir: __dirname,
      testEnvironment: 'node',
      testMatch: ['<rootDir>/rules/**/*.test.ts'],
      transform,
    },
  ],
};
