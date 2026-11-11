// Jest unificado (HU-056): suites de dominio de src/**/__tests__ (rama capstone-upn-test)
// + pruebas unitarias PU/SEC de __tests__/unit. Las pruebas de reglas (__tests__/rules)
// necesitan el emulador de Firebase y se ejecutan con `npm run test:rules`.
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^test-renderer$': 'react-test-renderer',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/mocks/async-storage.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/mobile/$1',
    '^@landing/(.*)$': '<rootDir>/src/landing/$1',
    '^@admin/(.*)$': '<rootDir>/src/admin/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.(ts|tsx|js)', '<rootDir>/__tests__/unit/**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/contracts/', '/dist/', '<rootDir>/__tests__/rules/'],
  modulePathIgnorePatterns: ['<rootDir>/__tests__/node_modules/', '<rootDir>/contracts/', '<rootDir>/functions/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|@react-native-async-storage|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
};
