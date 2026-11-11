/* global __dirname */
const path = require('path');
const ROOT = 'C:/Users/USER/Documents/Proyectos/OceanEyesAPP';
const slash = (p) => p.split(path.sep).join('/');
const MAIN = slash(path.join(__dirname, '..', 'main-9f533c6'));
const M = slash(path.join(__dirname, 'mocks'));

module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/suite/a/b/*.test.ts'],
  testTimeout: 120000,
  transform: {
    '^.+\\.[tj]sx?$': [require.resolve(ROOT + '/__tests__/node_modules/babel-jest'), { configFile: ROOT + '/__tests__/babel.config.js' }],
  },
  moduleDirectories: ['node_modules', ROOT + '/__tests__/node_modules', ROOT + '/node_modules'],
  moduleNameMapper: {
    '^react-native$': M + '/react-native.js',
    '^@react-native-async-storage/async-storage$': M + '/async-storage.js',
    '^@/shared/identity/device-id$': M + '/device-id.js',
    '^@/shared/offline/cloudinary$': M + '/upload.js',
    '^@/shared/offline/media$': M + '/upload.js',
    '^@/shared/offline/outbox$': M + '/outbox.js',
    '^@shared/blockchain/ledger$': M + '/ledger.js',
    '^@/(.*)$': MAIN + '/src/mobile/$1',
    '^@shared/(.*)$': MAIN + '/src/shared/$1',
  },
};
